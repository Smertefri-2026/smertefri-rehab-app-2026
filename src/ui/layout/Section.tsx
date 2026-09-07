import type { ReactNode } from "react";
import Container from "./Container";

export default function Section({
    children,
    id,
    className = "",
    containerClassName = "",
}: {
    children: ReactNode;
    id?: string;
    className?: string;
    containerClassName?: string;
}) {
    return (
        <section id={id} className={`py-20 ${className}`}>
            <Container className={containerClassName}>{children}</Container>
        </section>
    );
}