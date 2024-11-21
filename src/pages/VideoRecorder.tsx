import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Video, StopCircle, Save, Trash2, RefreshCcw, Brain ,ArrowLeft} from 'lucide-react';
import { Progress } from "@/components/shadcn/ui/progress";
import { Button } from "@/components/shadcn/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/ui/select";
import * as faceapi from 'face-api.js';
import { useNavigate, useParams } from 'react-router-dom';

interface VideoRecorderProps {
  viewOnly: boolean
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({viewOnly}: VideoRecorderProps) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [isMLActive, setIsMLActive] = useState(false);
  const [mlMode, setMlMode] = useState<'expression' | 'age-gender'>('expression');
  const [mlResult, setMlResult] = useState<string | null>(null);
  const [detectionInterval] = useState(500);
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { status, startRecording, stopRecording } = useReactMediaRecorder({
    video: true,
    audio: true,
    onStop: (blobUrl: string) => {
      setRecordedVideoUrl(blobUrl);
      setRecordingDuration(0);
    },
  });

  const isProcessing = useRef(false);
  const handleBack = () => {
    navigate(`/event/${roomId}`);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isMLActive) {
      loadModels();
    }
  }, [isMLActive]);

  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/machinelearning'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/machinelearning'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/machinelearning'),
        faceapi.nets.faceExpressionNet.loadFromUri('/machinelearning'),
        faceapi.nets.ageGenderNet.loadFromUri('/machinelearning')
      ]);
      showNotification('ML models loaded successfully');
    } catch (error) {
      console.error('Error loading ML models:', error);
      showNotification('Failed to load ML models');
    }
  };

  const runMLDetection = async () => {
    if (!webcamRef.current || !isMLActive || !canvasRef.current) return;
  
    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) return;
    if (isProcessing.current) return;
    isProcessing.current = true;
  
    try {
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
  
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();
  
      if (detection) {
        const resizedDetection = faceapi.resizeResults(detection, displaySize);
        
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetection);
  
        if (mlMode === 'expression') {
          const expressions = detection.expressions;
          const topExpression = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b);
          setMlResult(`Expression: ${topExpression[0]} (${(topExpression[1] * 100).toFixed(2)}%)`);
        } else {
          setMlResult(`Age: ${Math.round(detection.age)}, Gender: ${detection.gender}`);
        }
      } else {
        setMlResult('No face detected');
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      }
    } finally {
      isProcessing.current = false;
    }
  };  

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMLActive) {
      interval = setInterval(runMLDetection, detectionInterval);
    } else if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }
    return () => clearInterval(interval);
  }, [isMLActive, mlMode, detectionInterval]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    startRecording();
    showNotification('Recording started');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    stopRecording();
    showNotification('Recording stopped');
  };

  const deleteVideo = () => {
    setRecordedVideoUrl(null);
    showNotification('Video deleted');
  };

  const saveVideo = async () => {
    if (!recordedVideoUrl) return;

    try {
      const response = await fetch(recordedVideoUrl);
      const blob = await response.blob();
      
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `recorded-video-${new Date().toISOString()}.webm`,
          types: [{
            description: 'WebM video',
            accept: { 'video/webm': ['.webm'] },
          }],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        showNotification('Video saved successfully!');
      } else {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `recorded-video-${new Date().toISOString()}.webm`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification('Video download started');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      showNotification('Failed to save video');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {!viewOnly &&
        <Button
          onClick={handleBack}
          className="bg-white text-black hover:bg-gray-200 shadow-lg rounded-lg px-4 py-2 transition-all duration-200 border border-gray-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
      </Button>
      }

      {notification && (
        <div className="fixed top-4 right-4 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="relative">
          <Webcam
            audio={false}
            ref={webcamRef}
            width={1280}
            height={720}
            className="rounded-lg shadow-lg w-full"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
          />
          {!viewOnly && isRecording && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>{formatTime(recordingDuration)}</span>
            </div>
          )}
          {!viewOnly && isMLActive && mlResult && (
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg">
              {mlResult}
            </div>
          )}
        </div>

        {!viewOnly && isRecording && (
          <Progress value={recordingDuration % 60 * (100/60)} className="w-full" />
        )}

        {!viewOnly && 
          <div className="flex flex-wrap gap-4 justify-center">
            {!isRecording ? (
              <Button 
                onClick={handleStartRecording} 
                disabled={status === 'recording'}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Video className="w-5 h-5 mr-2" /> 
                Start Recording
              </Button>
            ) : (
              <Button 
                onClick={handleStopRecording} 
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <StopCircle className="w-5 h-5 mr-2" /> 
                Stop Recording
              </Button>
            )}
            
            <Button 
              onClick={saveVideo} 
              disabled={!recordedVideoUrl}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Save className="w-5 h-5 mr-2" /> 
              Save Video
            </Button>

            {!viewOnly && recordedVideoUrl && (
              <>
                <Button 
                  onClick={deleteVideo}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="w-5 h-5 mr-2" /> 
                  Delete Video
                </Button>
                <Button 
                  onClick={() => {
                    setRecordedVideoUrl(null);
                    handleStartRecording();
                  }}
                  className="border border-gray-300 hover:bg-gray-100"
                >
                  <RefreshCcw className="w-5 h-5 mr-2" /> 
                  Record New
                </Button>
              </>
            )}
            
            {!viewOnly && 
              <Button
                onClick={() => setIsMLActive(!isMLActive)}
                className={`${isMLActive ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-500 hover:bg-gray-600'} text-white`}
              >
                <Brain className="w-5 h-5 mr-2" />
                {isMLActive ? 'Disable ML' : 'Enable ML'}
              </Button>
            } 

            {!viewOnly && isMLActive && (
              <Select value={mlMode} onValueChange={(value: 'expression' | 'age-gender') => setMlMode(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select ML mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expression">Expression</SelectItem>
                  <SelectItem value="age-gender">Age & Gender</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        }

        {!viewOnly && recordedVideoUrl && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <video 
              src={recordedVideoUrl} 
              controls 
              className="rounded-lg shadow-lg w-full" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;

