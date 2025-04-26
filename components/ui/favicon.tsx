export default function Favicon() {
  const svgBase = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
         viewBox="0 0 24 24" fill="none" stroke="STROKE_COLOR" 
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m21 16-4 4-4-4"/>
      <path d="M17 20V4"/>
      <path d="m3 8 4-4 4 4"/>
      <path d="M7 4v16"/>
    </svg>
  `;

  const lightSvg = encodeURIComponent(svgBase.replace('STROKE_COLOR', 'black'));
  const darkSvg = encodeURIComponent(svgBase.replace('STROKE_COLOR', 'white'));

  return (
    <>
      <link
        rel="icon"
        href={`data:image/svg+xml,${lightSvg}`}
        type="image/svg+xml"
        media="(prefers-color-scheme: light)"
      />
      <link
        rel="icon"
        href={`data:image/svg+xml,${darkSvg}`}
        type="image/svg+xml"
        media="(prefers-color-scheme: dark)"
      />
    </>
  );
}
