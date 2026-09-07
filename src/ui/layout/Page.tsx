import type { ReactNode } from "react";
import Container from "./Container";

const spacingMap = {
    tight: "space-y-6",
    normal: "space-y-8",
    roomy: "space-y-10",
} as const;

export default function Page({
    children,
    title,
    subtitle,
    actions,
    actionsAlign = "right",
    spacing = "roomy",
    className = "",
    containerClassName = "",
    fullHeight = false,
}: {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
    actionsAlign?: "right" | "left";
    spacing?: keyof typeof spacingMap;
    className?: string;
    containerClassName?: string;
    fullHeight?: boolean;
}) {
    const mainBase = fullHeight ? "h-full min-h-0" : "min-h-screen";
    const hasHeader = !!title || !!subtitle || !!actions;

    const headerClass =
        actionsAlign === "right"
            ? "flex items-start justify-between gap-3"
            : "flex items-start justify-start gap-3";

    return (
        <main className={`${mainBase} bg-bg text-text overflow-x-clip ${className}`}>
            <Container className={`py-6 sm:py-10 ${spacingMap[spacing]} ${containerClassName}`}>
                {hasHeader && (
                    <div className={headerClass}>
                        {actionsAlign === "left" && actions ? <div className="shrink-0">{actions}</div> : null}

                        <div className="min-w-0">
                            {title ? <h1 className="text-base sm:text-lg font-semibold">{title}</h1> : null}
                            {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
                        </div>

                        {actionsAlign === "right" && actions ? <div className="shrink-0">{actions}</div> : null}
                    </div>
                )}

                {children}
            </Container>
        </main>
    );
}