# Quickstart
```
git clone
npm install
npm run dev
npm start (required for ai stuff)
```

Dont forget to run linter before pushing code.
```
npm run lint
npx eslint . --fix
```

# Objectives
- All-in-one application to manage and conduct virtual meeting events more seamlessly through pre-loaded content.
- Unit tested and documented, guaranteeing the system will continue to function correctly after any changes to code or team members.
- This project is a pivot from the previous project - Streamhub

# Features (MVP)
- Welcome: 3D model cartoon and click on welcome to redirect to home page
- Home: Either join an event or login/register as a host
- Create and Manage events (Host-only)
- Event Page(Host-only): Manage the content/module of your event and select which you want to show to viewers when live
- Waiting Room (Viewer): Games arcade below and a banner to determine if event host is ready and then join
- Viewer Page: View the content the host is sharing currently

Modules:
- Slideshow: Stack of slides to show to viewers, host can control which slide to show with arrows
- Video: Videos that host will show to viewers, host can play, pause, stop, forward/rewind the video
- Live Webcam: Share the host webcam to the viewer
- 3D model: Host can share the 3d model they want, both host and viewer can make the 3d model move independently on their end without affecting the other ends
- Poll: A question with set of options that viewers can vote for, host can view and share the result on their end, and also change back to live voting
- Q/A: Viewers can post a question they want to ask, the question will be either approved if related to product else moderated. When moderated the host can choose to approve or delete. Viewers can vote on the questions they liked. The selected question by host will be flashed on viewers side too.
- Whiteboard: Host can draw, change color/thickness and erase what they draw on a canvas. The viewers can only see what the host is drawing.

Others:
- Live Chat: Both host and viewers can use it to communicate with each other
- Emojis: Both host and viewers can send emojis.
- Games: Games that viewers can play while waiting for the event to start
- Chatbot: Viewers can use the chatbot to ask the questions they want.

# Stack
- BE: SpringBoot, Java, MySQL, WebSocket
- FE: React, Tailwind, RadixUI
- Testing: Vitest, React-Testing-Library

# Things to take note (developer only):
- Login, Register and CRUD for events uses database in the backend
- AI & ML related stuff are all done in the frontend
- Websocket connections for module switching and each modules are in the backend
- Interactive Q/A uses localstorage
- Slideshow, video and polls data are hardcoded
- Live webcam basically triggers to turn on webcam so the idea of sharing webcam works only when its shared on the same laptop