import React from 'react';

type IconName = 'thumbsUp' | 'thumbsDown' | 'warning' | 'document' | 'upload' | 'file' | 'info' | 'chatBubble' | 'flagUk' | 'flagIt';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const icons: Record<IconName, JSX.Element> = {
  thumbsUp: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.424 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75A2.25 2.25 0 0 1 16.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904M6.633 9H5.904a1.125 1.125 0 0 0-1.125 1.125v4.5A1.125 1.125 0 0 0 5.904 16.5h.729c.414 0 .806.149 1.125.404l.748.562a.75.75 0 0 0 .78.075l3.113-1.556a4.5 4.5 0 0 0 1.423-.23H15.88a.75.75 0 0 0 .75-.75V11.25a.75.75 0 0 0-.75-.75H13.48a4.5 4.5 0 0 0-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23Z" />
    </svg>
  ),
  thumbsDown: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.75c.806 0 1.533.424 2.031 1.08a9.041 9.041 0 0 1 2.861 2.4c.723.384 1.35.956 1.653 1.715a4.498 4.498 0 0 0 .322 1.672v1.05a.75.75 0 0 1-.75.75A2.25 2.25 0 0 1 16.5 19.5c0-1.152-.26-2.243-.723-3.218-.266-.558.107-1.282.725-1.282h3.126c1.026 0 1.945-.694 2.054-1.715.045-.422.068-.85.068-1.285a11.95 11.95 0 0 1-2.649-7.521c-.388-.482-.987-.729-1.605-.729H13.48c-.483 0-.964.078-1.423-.23l-3.114 1.04a4.501 4.501 0 0 0-1.423.23H5.904M7.498 16.5H5.904a1.125 1.125 0 0 1-1.125-1.125v-4.5A1.125 1.125 0 0 1 5.904 9.75h.729c.414 0 .806-.149 1.125-.404l.748-.562a.75.75 0 0 0 .78-.075l3.113 1.556a4.5 4.5 0 0 0 1.423.23H15.88a.75.75 0 0 0 .75.75v1.5a.75.75 0 0 0-.75.75H13.48a4.5 4.5 0 0 0-1.423-.23l-3.114 1.04a4.501 4.501 0 0 0-1.423-.23Z" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  document: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  upload: (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
    </svg>
  ),
  file: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  ),
  chatBubble: (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.17 48.17 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
    </svg>
  ),
  flagUk: (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="1.414"><path d="M0 0h512v512H0z" fill="#00247d"/><path d="M512 0v60.93L60.93 512H0v-60.93L451.07 0zm-512 512v-60.93L451.07 0H512v60.93L60.93 512z" fill="#fff"/><path d="M193.38 0h125.24v512H193.38zm-193.38 193.38h512v125.24h-512z" fill="#fff"/><path d="M214.39 0h83.22v512h-83.22zm-214.39 214.39h512v83.22h-512z" fill="#cf142b"/><path d="M512 110.14 369.37 256l142.63 145.86V512L256 369.37 110.14 512H0v-110.14L142.63 256 0 110.14V0l142.63 142.63L256 0h.01z" fill="none"/><path d="m341.33 256 170.67 170.67V512h-85.33L256 341.33 85.33 512H0v-85.33L170.67 256 0 85.33V0h85.33L256 170.67 426.67 0H512v85.33z" fill="#cf142b"/></svg>
  ),
  flagIt: (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd" strokeWidth="1pt"><path d="M0 0h170.67v512H0z" fill="#009246"/><path d="M170.67 0h170.66v512h-170.66z" fill="#fff"/><path d="M341.33 0H512v512H341.33z" fill="#ce2b37"/></g></svg>
  )
};

export const Icon: React.FC<IconProps> = ({ name, className, ...props }) => {
  const Svg = React.cloneElement(icons[name], {
    className: className || "h-6 w-6",
    ...props
  });
  return Svg;
};
