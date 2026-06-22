import { useState } from 'react'
import { FaCheck, FaCopy } from 'react-icons/fa'

const CopyUrl = () => {

  const [copyButtonText, setCopyButtonText] = useState('Copy link to share');
  const [isCopied, setIsCopied] = useState(false);

    const handleCopyLink = () => {
        const contestUrl = window.location.href;
        navigator.clipboard
          .writeText(contestUrl)
          .then(() => {
            setIsCopied(true);
            setCopyButtonText('Copied!');
            setTimeout(() => {
              setIsCopied(false);
              setCopyButtonText('Copy link to share');
            }, 2000);
          })
          .catch((error) => {
            console.error('Failed to copy text: ', error);
          });
      };

  return (
    <div className='flex justify-center'>
        <button onClick={handleCopyLink} className='inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100'>
        {isCopied ? (
            <FaCheck className='mr-2' />
        ) : (
            <FaCopy className='mr-2' />
        )}
        {copyButtonText}
        </button>
    </div>
  )
}

export default CopyUrl
