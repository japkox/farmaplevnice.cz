import { ReactNode } from "react";

interface ParagraphProps {
    children: ReactNode;
    className?: string;
}

export function Paragraph({ children, className = '' }: ParagraphProps) {
    return (
        <p className={`text-base leading-relaxed text-gray-700 py-1 ${className}`}>
            {children}
        </p>
    );
}