import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Button } from "@/components//ui/button";
import { Video, StopCircle, Save } from 'lucide-react';

const VideoRecorder: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const { status, startRecording, stopRecording } = useReactMediaRecorder({
    video: true,
    audio: true,
    onStop: (blobUrl: string) => {
      setRecordedVideoUrl(blobUrl);
    },
  });

  const handleStartRecording = () => {
    setIsRecording(true);
    startRecording();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    stopRecording();
  };

  const saveVideo = async () => {
    if (!recordedVideoUrl) return;

    try {
      const response = await fetch(recordedVideoUrl);
      const blob = await response.blob();
      
      // Use File System Access API to save the file
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: 'recorded-video.webm',
          types: [{
            description: 'WebM video',
            accept: { 'video/webm': ['.webm'] },
          }],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        alert('Video saved successfully!');
      } else {
        // Fallback for browsers that don't support File System Access API
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'recorded-video.webm';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        alert('Video download started. Please check your downloads folder.');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Failed to save video. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Webcam
        audio={false}
        ref={webcamRef}
        width={640}
        height={480}
        className="rounded-lg shadow-lg"
      />
      <div className="flex space-x-4">
        {!isRecording ? (
          <Button onClick={handleStartRecording} disabled={status === 'recording'}>
            <Video className="mr-2 h-4 w-4" /> Start Recording
          </Button>
        ) : (
          <Button onClick={handleStopRecording} variant="destructive">
            <StopCircle className="mr-2 h-4 w-4" /> Stop Recording
          </Button>
        )}
        <Button onClick={saveVideo} disabled={!recordedVideoUrl}>
          <Save className="mr-2 h-4 w-4" /> Save Video
        </Button>
      </div>
      {recordedVideoUrl && (
        <video src={recordedVideoUrl} controls className="mt-4 rounded-lg shadow-lg" width={640} height={480} />
      )}
    </div>
  );
};

export default VideoRecorder;