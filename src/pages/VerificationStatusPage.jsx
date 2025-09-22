import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PdfIcon from '../assets/pdf.svg';
import UploadCloudIcon from '../assets/upload-cloud.svg';
import CalendarIcon from '../assets/Calendar.svg';
import InfoIcon from '../assets/info.svg';
import ArrowLeftIcon from '../assets/arrow-left.svg';

const Pill = ({ label, tone = 'gray' }) => {
    const toneClasses = {
        green: 'bg-[#E4FBED] text-[#1EB154] font-medium border border-[#DBF9E7]',
        yellow: 'bg-[#FFF1D9] text-[#F59E0B] font-medium border border-[#FFEBCA]',
        red: 'bg-[#FFE4E4] text-[#EF4444] font-medium border border-[#FFDDDD]',
    }[tone];

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${toneClasses}`}>{label}</span>
    );
};

const RowMeta = ({ icon, text }) => (
    <div className="flex items-center gap-2 text-xs text-primary-200 font-medium">
        <img src={icon} alt="" className="w-4 h-4" />
        <span>{text}</span>
    </div>
);

const DocumentRow = ({ name, status, uploadedAt, expiry, tone, actionText = 'Replace File' }) => (
    <div className="w-full rounded-xl border border-[#F3F3F3] bg-white p-4 sm:p-5 flex flex-col gap-3 shadow-custom">
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <img src={PdfIcon} alt="PDF" className="w-5 h-5" />
                <span className="text-sm sm:text-base font-medium text-primary-500">{name}</span>
            </div>
            <Pill label={status} tone={tone} />
        </div>
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 flex-wrap">
                {uploadedAt && <RowMeta icon={CalendarIcon} text={`Uploaded: ${uploadedAt}`} />}
                {expiry && <RowMeta icon={CalendarIcon} text={`Expiry: ${expiry}`} />}
            </div>
            <button type="button" className="text-sm font-medium text-[#1F6FEB] hover:text-[#1d4ed8] underline cursor-pointer self-start">
                {actionText}
            </button>
        </div>
    </div>
);

const UploadDropzone = ({ onPick }) => {
    const inputRef = useRef(null);
    const handleClick = () => inputRef.current?.click();

    return (
        <div className="rounded-xl border-2 border-dashed border-[#E5E7EB] p-6 sm:p-8 text-center cursor-pointer hover:border-primary-500 transition-colors" onClick={handleClick}>
            <div className="flex flex-col items-center">
                <div className="rounded-full bg-[#EBF2FD] p-3 sm:p-4">
                    <img src={UploadCloudIcon} alt="Upload" className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <span className="mt-3 text-sm font-semibold text-[#1F6FEB]">Click Here</span>
                <span className="text-xs text-primary-200 font-medium">to Upload PDF/JPEG</span>
            </div>
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => onPick?.(e.target.files?.[0] || null)} />
        </div>
    );
};

const VerificationStatusPage = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState('');
    const [pickedFileName, setPickedFileName] = useState('');

    const docTypes = useMemo(() => [
        { value: '', label: 'Document Type' },
        { value: 'police', label: 'Police Check' },
        { value: 'visa', label: 'Visa / Work Rights' },
        { value: 'photoId', label: 'Photo ID' },
        { value: 'abn', label: 'ABN' },
    ], []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="mx-auto w-full max-w-3xl px-4 py-6">
                {/* Page title with back */}
                <div className="mb-4 flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="p-1 -ml-1 cursor-pointer">
                        <img src={ArrowLeftIcon} alt="Back" className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg sm:text-xl font-semibold text-primary-500">Verification & Documents</h1>
                </div>

                {/* Common rounded container */}
                <div className="bg-white rounded-2xl border border-[#F3F3F3] p-4 sm:p-5 space-y-6">

                    {/* ABN verified card */}
                    <div className="rounded-2xl border border-[#F3F3F3] bg-white p-4 sm:p-5 mb-4 shadow-custom">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={PdfIcon} alt="PDF" className="w-5 h-5" />
                                <span className="text-sm sm:text-base font-medium text-primary-500">ABN.pdf</span>
                            </div>
                            <Pill label="Verified" tone="green" />
                        </div>
                        <button type="button" className="mt-3 text-sm font-medium text-[#1F6FEB] hover:text-[#1d4ed8] underline">Re-verify ABN</button>
                    </div>

                    {/* Add verification document */}
                    <div className="rounded-2xl border border-[#F3F3F3] bg-white p-4 sm:p-5 mb-6 shadow-custom">
                        <h2 className="text-sm font-semibold text-primary-500 mb-3">Add Verification Document</h2>
                        <div className="rounded-xl border border-[#E5E7EB] px-4 py-3 flex items-center justify-between">
                            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full bg-transparent outline-none text-sm font-medium text-primary-500">
                                {docTypes.map((d) => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-4">
                            <UploadDropzone onPick={(f) => setPickedFileName(f?.name || '')} />
                            {pickedFileName && (
                                <div className="mt-2 text-xs text-green-600">✓ {pickedFileName}</div>
                            )}
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <button type="button" className="rounded-full border border-[#E5E7EB] px-5 py-2 text-sm font-medium text-primary-500 hover:bg-gray-50">Reset</button>
                            <button type="button" className="rounded-full bg-primary-500 px-5 py-2 text-sm font-medium text-white hover:bg-primary-600">Submit for Review</button>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-primary-500">Police Check</h3>
                            <DocumentRow name="Police Check.pdf" status="Pending" tone="yellow" uploadedAt="Aug 28, 2025" />
                        
                            <h3 className="text-sm font-semibold text-primary-500 ">Visa</h3>
                            <DocumentRow name="Visa.pdf" status="Rejected" tone="red" uploadedAt="Aug 25, 2025" />
                            <div className="mt-1 flex items-start  gap-2 text-xs text-primary-200 font-medium">
                                <img src={InfoIcon} alt="Info" className="w-4 h-4" />
                                <span>Photo blurry — please upload a clear scan.</span>
                            </div>

                            <h3 className="text-sm font-semibold text-primary-500 mb-3">Photo ID</h3>
                            <DocumentRow name="Photo ID.pdf" status="Verified" tone="green" uploadedAt="Aug 20, 2025" expiry="2029-08-20" />
                            <div className="mt-1 flex items-start gap-2 text-xs text-primary-200 font-medium">
                                <img src={InfoIcon} alt="Info" className="w-4 h-4" />
                                <span>Your Photo ID will expire in 14 days. Please upload a new one to avoid suspension.</span>
                            </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationStatusPage;


