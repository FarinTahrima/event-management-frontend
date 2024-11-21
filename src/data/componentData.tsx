import React from "react";
import {Image,FileVideo,Radio,BarChart2,Box,Presentation, MessageCircleQuestion} from "lucide-react";
import VideoRecorder from "../pages/VideoRecorder";
import ViewOnlyModelViewer from "@/pages/ModelViewer/ViewOnlyModelViewer";
import { PollResponse } from "@/pages/host/HostCreatePoll";

export type ComponentLink = string | ((roomId: string) => string);

export interface ComponentItem {
  id: string;
  type: string;
  title: string;
  icon: React.ReactNode;
  content?: string;
  imageUrl?: string;
  htmlContent?: React.ReactNode;
  getLink: ComponentLink; 
  images?: string[];
  currentImageIndex?: number;
}

export const Poll: PollResponse = {
  pollId: 1,
  pollQuestion: "Which laptop do you use?",
  pollOptionList: [
    {
      pollOptionId: 1,
      value: "Acer",
      description: "",
      imageUrl: "Acer.jpg",
      voteCount: 0,
    },
    {
      pollOptionId: 2,
      value: "Lenovo",
      description: "",
      imageUrl: "Lenovo.jpg",
      voteCount: 0,
    },
    {
      pollOptionId: 3,
      value: "Mac",
      description: "",
      imageUrl: "Mac.jpg",
      voteCount: 0,
    }
  ],
  voted: false,
  selectedPollOption: null,
};

export const Components: ComponentItem[] = [
  {
    id: "1",
    type: "slide",
    title: "Slide Presentation",
    icon: <Image className="w-6 h-6" />,
    content: "Welcome to the presentation!",
    images: [
      "https://picsum.photos/id/0/800/400",
      "https://picsum.photos/id/1/800/400",
      "https://picsum.photos/id/2/800/400",
    ],
    currentImageIndex: 0,
    getLink: "/slide",
  },
  {
    id: "2",
    type: "video",
    title: "Demo Video",
    icon: <FileVideo className="w-6 h-6" />,
    getLink: (roomId: string) => `/record/${roomId}`,
    htmlContent: null,
  },
  {
    id: "3",
    type: "live-webcam",
    title: "Live Webcam",
    icon: <Radio className="w-6 h-6" />,
    content: "See it Live",
    getLink: "/live",
    htmlContent: <VideoRecorder viewOnly />,
  },
  {
    id: "4",
    type: "poll",
    title: "Poll",
    icon: <BarChart2 className="w-6 h-6" />,
    content: "Create an interactive poll",
    getLink: (roomId: string) => `/poll/${roomId}`,
    htmlContent: null,
  },
  {
    id: "5",
    type: "model",
    title: "3D Model",
    icon: <Box className="w-6 h-6" />,
    getLink: (roomId: string) => `/model/${roomId}`,
    htmlContent: <ViewOnlyModelViewer />,
  },
  {
    id: "6",
    type: "interactive-qa",
    title: "Q&A",
    icon: <MessageCircleQuestion className="w-6 h-6" />,
    content: "Interactive Q&A",
    getLink: "/interactive-qa",
    htmlContent: null,
  },
  {
    id: "7",
    type: "whiteboard",
    title: "Whiteboard",
    icon: <Presentation className="w-6 h-6" />,
    getLink: "/whiteboard",
    htmlContent: null,
  },
];
