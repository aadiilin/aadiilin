import React from "react";

export type AvatarDef = {
  id: number;
  name: string;
  color: string;
  render: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
};

export const AVATARS: AvatarDef[] = [
  {
    id: 1,
    name: "Spike",
    color: "#FF007F",
    render: (props) => (
      <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
        <polygon points="50,5 95,95 5,95" />
        <circle cx="50" cy="65" r="12" fill="#000" />
      </svg>
    ),
  },
  {
    id: 2,
    name: "Blob",
    color: "#00FFFF",
    render: (props) => (
      <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
        <path d="M48.5,13.5C71.5,8.5 89.5,28.5 90.5,52.5C91.5,76.5 73.5,91.5 50.5,92.5C27.5,93.5 8.5,76.5 7.5,52.5C6.5,28.5 25.5,18.5 48.5,13.5Z" />
        <rect x="30" y="40" width="15" height="15" fill="#000" rx="7.5" />
        <rect x="60" y="40" width="15" height="15" fill="#000" rx="7.5" />
      </svg>
    ),
  },
  {
    id: 3,
    name: "Cube",
    color: "#FFFF00",
    render: (props) => (
      <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
        <rect x="15" y="15" width="70" height="70" rx="10" />
        <path d="M 35 45 Q 50 60 65 45" stroke="#000" strokeWidth="8" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 4,
    name: "Star",
    color: "#AA00FF",
    render: (props) => (
      <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
        <polygon points="50,5 61,35 93,35 68,54 77,84 50,65 23,84 32,54 7,35 39,35" />
        <circle cx="35" cy="50" r="6" fill="#000" />
        <circle cx="65" cy="50" r="6" fill="#000" />
      </svg>
    ),
  },
  {
    id: 5,
    name: "Hex",
    color: "#00FF00",
    render: (props) => (
      <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
        <polygon points="50,5 89,27 89,72 50,95 11,72 11,27" />
        <line x1="30" y1="40" x2="45" y2="55" stroke="#000" strokeWidth="8" strokeLinecap="round" />
        <line x1="70" y1="40" x2="55" y2="55" stroke="#000" strokeWidth="8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 6,
    name: "Cyl",
    color: "#FF5500",
    render: (props) => (
      <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
        <rect x="25" y="10" width="50" height="80" rx="25" />
        <ellipse cx="50" cy="35" rx="10" ry="15" fill="#000" />
      </svg>
    ),
  },
  {
    id: 7,
    name: "Rhomb",
    color: "#FF0055",
    render: (props) => (
      <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
        <polygon points="50,5 90,50 50,95 10,50" />
        <path d="M 40 60 L 60 60" stroke="#000" strokeWidth="8" strokeLinecap="round" />
        <circle cx="50" cy="40" r="8" fill="#000" />
      </svg>
    ),
  },
  {
    id: 8,
    name: "Cloud",
    color: "#0088FF",
    render: (props) => (
      <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
        <path d="M 25 65 A 20 20 0 0 1 40 30 A 25 25 0 0 1 75 45 A 20 20 0 0 1 75 80 L 25 80 A 20 20 0 0 1 25 65 Z" />
        <circle cx="45" cy="55" r="5" fill="#000" />
        <circle cx="65" cy="55" r="5" fill="#000" />
      </svg>
    ),
  }
];

export function getAvatar(id: number) {
  return AVATARS.find(a => a.id === id) || AVATARS[0];
}
