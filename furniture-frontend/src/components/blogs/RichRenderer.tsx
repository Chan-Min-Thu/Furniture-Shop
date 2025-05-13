import React from "react";
import Dompurify from "dompurify";

interface Props extends React.HTMLProps<HTMLDivElement> {
  content: string;
  className: string;
}
function RichRenderer({ content, className }: Props) {
  const cleanHtml = Dompurify.sanitize(content);
  return (
    <div
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
      className={className}
    />
  );
}

export default RichRenderer;
