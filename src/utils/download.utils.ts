/**
 * Downloads a file from a given URL.
 * Creates a temporary anchor element and triggers a click to download.
 * 
 * @param url The URL of the file to download.
 * @param filename Optional filename for the downloaded file.
 */
export const downloadFileFromUrl = (url: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = url;
    if (filename) {
        link.download = filename;
    }
    link.target = '_blank'; // Open in new tab if it's a viewable file, or standard download behavior
    link.rel = 'noopener noreferrer';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
