import { ReactNode } from "react";

interface HeaderProps {
    children: ReactNode;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
};

export function Header({ children, className = '', size = "md", }: HeaderProps) {
    const textSize = sizeMap[size]
    return <h2 className={`font-bold py-2 ${textSize} ${className}`}>{children}</h2>;
    
}