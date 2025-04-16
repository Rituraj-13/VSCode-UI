import React, { useEffect, useRef } from 'react';

interface HtmlPreviewProps {
    content: string;
}

export default function HtmlPreview({ content }: HtmlPreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (iframeRef.current) {
            const iframe = iframeRef.current;
            const doc = iframe.contentDocument || iframe.contentWindow?.document;

            if (doc) {
                doc.open();
                doc.write(content);
                doc.close();
            }
        }
    }, [content]);

    return (
        <iframe
            ref={iframeRef}
            className="w-full h-full border-none"
            sandbox="allow-same-origin allow-scripts"
            title="HTML Preview"
        />
    );
}