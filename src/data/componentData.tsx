import React from 'react';
import { Image, FileVideo, Radio, BarChart2, Box, Bird } from 'lucide-react';
import VideoRecorder from '../pages/VideoRecorder';
import ViewOnlyModelViewer from '@/pages/ModelViewer/ViewOnlyModelViewer';
import { PollResponse } from '@/pages/host/HostCreatePoll';
import SelectedQuestion from '@/pages/components/SelectedQuestion';

export interface ComponentItem {
  id: string;
  type: string;
  title: string;
  icon: React.ReactNode;
  content?: string;
  imageUrl?: string;
  htmlContent?: React.ReactNode;
  link: string;
  images?: string[];  
  currentImageIndex?: number;  
}


export const Poll: PollResponse = {
  "pollId": 1,
  "pollQuestion": "Which device are you using?",
  "pollOptionList": [
      {
          "pollOptionId": 1,
          "value": "Apple",
          "description": "",
          "imageUrl": "1-1-Apple.jpg",
          "voteCount": 0
      },
      {
          "pollOptionId": 2,
          "value": "Windows",
          "description": "",
          "imageUrl": "1-2-windows.png",
          "voteCount": 0
      },
      {
        "pollOptionId": 3,
        "value": "Blueberry",
        "description": "",
        "imageUrl": "1-3-blueberry.jpeg",
        "voteCount": 0
      }
  ],
  "voted": false,
  "selectedPollOption": null
};

export const Components: ComponentItem[] = [
  {
    id: "1",
    type: "slide",
    title: "Slide Presentation",
    icon: <Image className="w-6 h-6" />,
    content: "Welcome to the presentation!",
    images: [
      "https://picsum.photos/id/0/600/300",
      "https://picsum.photos/id/1/600/300",
      "https://picsum.photos/id/2/600/300",
      // Add more images as needed
    ],
    currentImageIndex: 0,
    link: "/slide",
  },
  {
    id: "2",
    type: "video",
    title: "Demo Video",
    icon: <FileVideo className="w-6 h-6" />,
    content: "Demo Video",
    link: "/record",
  },
  {
    id: "3",
    type: "live-webcam",
    title: "Live Webcam",
    icon: <Radio className="w-6 h-6" />,
    content: "See it Live",
    link: "/live",
    htmlContent: <VideoRecorder viewOnly />,
  },
  {
    id: "4",
    type: "poll",
    title: "Poll",
    icon: <BarChart2 className="w-6 h-6" />,
    content: "Create an interactive poll",
    link: "/poll/:roomId",
    htmlContent: null,
  },
  {
    id: "5",
    type: "model",
    title: "3D Model",
    icon: <Box className="w-6 h-6" />,
    link: "/model",
    htmlContent: <ViewOnlyModelViewer />,
  },
  {
    id: "6",
    type: "pigeon-hole",
    title: "Pigeon Hole",
    icon: <Bird className="w-6 h-6" />,
    content: "Interactive Q&A",
    link: "/pigeon",
    htmlContent: <SelectedQuestion />,
  },
];