import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc,
    getDoc,
    setDoc,
    getDocs,
    writeBatch,
} from 'firebase/firestore';
import { 
    getStorage, 
    ref, 
    uploadBytesResumable, 
    getDownloadURL, 
    deleteObject 
} from 'firebase/storage';

// --- ICONS (Heroicons & Custom) ---
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
    </svg>
);
const MagnifyingGlassIcon = ({ className = "w-5 h-5 text-gray-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
    </svg>
);
const Squares2x2Icon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M2.5 3A1.5 1.5 0 001 4.5v2.5A1.5 1.5 0 002.5 8.5h2.5A1.5 1.5 0 006.5 7V4.5A1.5 1.5 0 005 3H2.5zM2.5 11.5A1.5 1.5 0 001 13v2.5A1.5 1.5 0 002.5 17h2.5A1.5 1.5 0 006.5 15.5V13A1.5 1.5 0 005 11.5H2.5zM11.5 3A1.5 1.5 0 0010 4.5v2.5A1.5 1.5 0 0011.5 8.5h2.5A1.5 1.5 0 0015.5 7V4.5A1.5 1.5 0 0014 3h-2.5zM11.5 11.5A1.5 1.5 0 0010 13v2.5A1.5 1.5 0 0011.5 17h2.5A1.5 1.5 0 0015.5 15.5V13A1.5 1.5 0 0014 11.5h-2.5z" clipRule="evenodd" />
    </svg>
);
const ListBulletIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);
const XMarkIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const TrashIcon = ({className="w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25V4c.827-.05 1.66-.075 2.5-.075zM8.47 9.125a.75.75 0 011.06 0L10 9.69l.47-.47a.75.75 0 111.06 1.06L11.06 11l.47.47a.75.75 0 11-1.06 1.06L10 12.06l-.47.47a.75.75 0 11-1.06-1.06L8.94 11l-.47-.47a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);
const ShieldCheckIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
    </svg>
);
const QuestionMarkCircleIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
);
const WrenchScrewdriverIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.472-2.472a3.375 3.375 0 00-4.773-4.773L6.75 10.5M11.42 15.17L6.75 10.5m4.67 4.67l-2.472-2.472a3.375 3.375 0 00-4.773-4.773L6.75 10.5" />
    </svg>
);
const ArrowRightOnRectangleIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);


// --- FIREBASE CONFIGURATION & INITIALIZATION ---
const firebaseConfig = {
    apiKey: "AIzaSyAbdI2hOjwHSDthSvg8ySZy7-uygwFboJE",
    authDomain: "property-management-suit-579f6.firebaseapp.com",
    projectId: "property-management-suit-579f6",
    storageBucket: "property-management-suit-579f6.firebasestorage.app",
    messagingSenderId: "69312237426",
    appId: "1:69312237426:web:76fd7f341abc7cfde097eb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const propertiesCollectionRef = collection(db, "properties");


// --- INITIAL DATA ---
const initialPropertiesData = [
    {
        name: "Armoury Court",
        address: `Preston Street West, Macclesfield, SK11 8HQ`,
        units: `18 Units`,
        contacts: {
            directors: `G. Parker – 07804 747 584 (Apt 15)\nRichard Kilbride – 01625 502946 (Apt 5)`,
            emergency: `Kingston Maintenance – 0161 302 2577`,
        },
        siteDetails: {
            entrySystem: `N/A`,
            keySafe: ``,
            waterStopCock: `N/A`,
            refuseInfo: `Cheshire East – 0300 123 5011\nCollection Day - Thursday`,
        },
        periodicTests: {
            fixedWiring: `Josh Jefferson 26.1.19 (5 yrs)`,
            fireRiskAssessment: `Justin Jones 05/04/2021`,
            insuranceRevaluation: `02/02/2021 (3 yrs)`,
            legionnaires: `N/A`,
        },
        utilities: {
            landlordSupply: `Electricity`,
            meters: `Electric – Opus energy (0843 227 2377)\nContract Number – 2184686\nMPAN: 16 1001 1758 152\nLocated on the wall at the side of flat 2`,
        },
        keySystems: {
            firePanel: `N/A`,
            emergencyLighting: `N/A`,
            smokeVents: `N/A`,
            pumps: `N/A`,
            lifts: `N/A`,
            electricGates: `N/A`,
        },
        insurance: {
            provider: `Fowler Penfold`,
            renewalDate: `01/01/2023`,
            reinstatementValue: `£1,828,715 – 25/2/2020`,
        },
        financials: {
            companiesHouseNumber: `02325018`,
            yearEnd: ``,
            serviceCharge: ``,
        },
        contractors: {
            cleaners: `No window cleaner`,
            gardeners: `A.J Broadhurst – 07788 906 501 / 01260 276468`,
            preferred: `A Kennerley – 07962 356 111`,
            roofing: `Dean Manchester Direct Roofing 07501 452923`,
            televisionSky: `A.V.Royle – 07528 586 171`,
        },
        documents: [],
        archived: false
    }
];

// This is a new property template with all fields to ensure consistency.
const newPropertyTemplate = {
    name: "New Property",
    address: "",
    units: "",
    contacts: { directors: "", emergency: "", onSite: "" },
    siteDetails: { entrySystem: "", keySafe: "", waterStopCock: "", refuseInfo: "", siteInfo: "" },
    periodicTests: { fixedWiring: "", fireRiskAssessment: "", insuranceRevaluation: "", legionnaires: "", asbestosSurvey: "" },
    utilities: { landlordSupply: "", meters: "" },
    keySystems: { firePanel: "", emergencyLighting: "", smokeVents: "", pumps: "", lifts: "", electricGates: "", monitoring: "", cctv: "", phoneLines: "" },
    insurance: { provider: "", renewalDate: "", reinstatementValue: "" },
    financials: { companiesHouseNumber: "", yearEnd: "", serviceCharge: "" },
    contractors: { cleaners: "", gardeners: "", preferred: "", roofing: "", televisionSky: "", doorEntry: "", doorSystems: "", alarmAndEml: "", bt: "", electrician: "", plumbers: "" },
    documents: [],
    archived: false,
};

// --- HELPER COMPONENTS ---

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
);

const Modal = ({ show, onClose, title, children, maxWidth = 'max-w-4xl' }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4" onClick={onClose}>
            <div className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                       <XMarkIcon className="w-8 h-8"/>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ show, onClose, onConfirm, title, message, confirmButtonClass = 'bg-red-600', confirmText = 'Confirm' }) => {
    if (!show) return null;
    return (
        <Modal show={show} onClose={onClose} title={title} maxWidth="max-w-lg">
            <div className="p-6">
                 <p className="text-lg text-gray-600 mb-6">{message}</p>
                 <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-shadow shadow-sm">Cancel</button>
                    <button onClick={onConfirm} className={`px-6 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-shadow shadow-sm hover:shadow-md ${confirmButtonClass}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const NotificationModal = ({ show, onClose, title, message }) => {
    if(!show) return null;
    return (
         <Modal show={show} onClose={onClose} title={title} maxWidth="max-w-lg">
             <div className="p-6">
                <p className="text-lg text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-[#17A2B8] text-white font-semibold hover:opacity-90 transition-shadow shadow-sm hover:shadow-md">OK</button>
                </div>
            </div>
        </Modal>
    )
}

const AddNewFieldModal = ({ show, onClose, onAddField }) => {
    const [fieldName, setFieldName] = useState('');

    const handleSubmit = () => {
        if (fieldName.trim()) {
            onAddField(fieldName.trim());
            setFieldName('');
            onClose();
        }
    };

    if (!show) return null;

    return (
        <Modal show={show} onClose={onClose} title="Add New Contractor Field" maxWidth="max-w-md">
            <div className="p-6 space-y-4">
                <FormInput
                    label="Contractor Type"
                    name="newFieldName"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="e.g., Pest Control, Locksmith"
                />
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-[#17A2B8] text-white font-semibold">Add Field</button>
                </div>
            </div>
        </Modal>
    );
}

// --- FORM TAB COMPONENTS ---

const formTabs = [
    "Core Info", "Contacts", "Site Details", "Periodic Tests", "Utilities", 
    "Key Systems", "Insurance", "Financials", "Contractors", "Documents"
];

// Generic Input for Text
const FormInput = ({ label, name, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input
            type="text"
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] focus:border-[#17A2B8] transition"
        />
    </div>
);

// Generic Input for Textarea
const FormTextarea = ({ label, name, value, onChange, placeholder, rows = 4 }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <textarea
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            rows={rows}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] focus:border-[#17A2B8] transition"
        />
    </div>
);

const CoreInfoTab = ({ data, handleChange }) => (
    <div className="space-y-6">
        <FormInput label="Property Name" name="name" value={data.name} onChange={handleChange} />
        <FormTextarea label="Address" name="address" value={data.address} onChange={handleChange} />
        <FormTextarea label="Units Description" name="units" value={data.units} onChange={handleChange} />
    </div>
);

const ContactsTab = ({ data, handleChange }) => (
    <div className="space-y-6">
        <FormTextarea label="Directors" name="contacts.directors" value={data.contacts?.directors} onChange={handleChange} />
        <FormTextarea label="Emergency Contact" name="contacts.emergency" value={data.contacts?.emergency} onChange={handleChange} />
        <FormTextarea label="On-site Contact" name="contacts.onSite" value={data.contacts?.onSite} onChange={handleChange} />
    </div>
);

const SiteDetailsTab = ({ data, handleChange }) => (
    <div className="space-y-6">
        <FormTextarea label="Entry System" name="siteDetails.entrySystem" value={data.siteDetails?.entrySystem} onChange={handleChange} />
        <FormTextarea label="Key Safe Codes" name="siteDetails.keySafe" value={data.siteDetails?.keySafe} onChange={handleChange} />
        <FormTextarea label="Water Stop-Cock Location" name="siteDetails.waterStopCock" value={data.siteDetails?.waterStopCock} onChange={handleChange} />
        <FormTextarea label="Refuse Information" name="siteDetails.refuseInfo" value={data.siteDetails?.refuseInfo} onChange={handleChange} />
        <FormTextarea label="General Site Information" name="siteDetails.siteInfo" value={data.siteDetails?.siteInfo} onChange={handleChange} />
    </div>
);

const PeriodicTestsTab = ({ data, handleChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormTextarea label="Fixed Wiring (EICR)" name="periodicTests.fixedWiring" value={data.periodicTests?.fixedWiring} onChange={handleChange} />
        <FormTextarea label="Fire Risk Assessment" name="periodicTests.fireRiskAssessment" value={data.periodicTests?.fireRiskAssessment} onChange={handleChange} />
        <FormTextarea label="Insurance Revaluation" name="periodicTests.insuranceRevaluation" value={data.periodicTests?.insuranceRevaluation} onChange={handleChange} />
        <FormTextarea label="Legionnaires Risk Assessment" name="periodicTests.legionnaires" value={data.periodicTests?.legionnaires} onChange={handleChange} />
        <FormTextarea label="Asbestos Survey" name="periodicTests.asbestosSurvey" value={data.periodicTests?.asbestosSurvey} onChange={handleChange} />
    </div>
);

const UtilitiesTab = ({ data, handleChange }) => (
    <div className="space-y-6">
        <FormTextarea label="Landlord Supply Details" name="utilities.landlordSupply" value={data.utilities?.landlordSupply} onChange={handleChange} />
        <FormTextarea label="Meter Information" name="utilities.meters" value={data.utilities?.meters} onChange={handleChange} rows={6} />
    </div>
);

const KeySystemsTab = ({ data, handleChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FormTextarea label="Fire Panel" name="keySystems.firePanel" value={data.keySystems?.firePanel} onChange={handleChange} />
        <FormTextarea label="Emergency Lighting" name="keySystems.emergencyLighting" value={data.keySystems?.emergencyLighting} onChange={handleChange} />
        <FormTextarea label="Smoke Vents" name="keySystems.smokeVents" value={data.keySystems?.smokeVents} onChange={handleChange} />
        <FormTextarea label="Water/Sewer Pumps" name="keySystems.pumps" value={data.keySystems?.pumps} onChange={handleChange} />
        <FormTextarea label="Lifts" name="keySystems.lifts" value={data.keySystems?.lifts} onChange={handleChange} />
        <FormTextarea label="Electric Gates" name="keySystems.electricGates" value={data.keySystems?.electricGates} onChange={handleChange} />
        <FormTextarea label="Monitoring Systems" name="keySystems.monitoring" value={data.keySystems?.monitoring} onChange={handleChange} />
        <FormTextarea label="CCTV" name="keySystems.cctv" value={data.keySystems?.cctv} onChange={handleChange} />
        <FormTextarea label="Phone Lines" name="keySystems.phoneLines" value={data.keySystems?.phoneLines} onChange={handleChange} />
    </div>
);

const InsuranceTab = ({ data, handleChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Provider" name="insurance.provider" value={data.insurance?.provider} onChange={handleChange} />
        <FormInput label="Renewal Date" name="insurance.renewalDate" value={data.insurance?.renewalDate} onChange={handleChange} />
        <FormTextarea label="Reinstatement Value & Notes" name="insurance.reinstatementValue" value={data.insurance?.reinstatementValue} onChange={handleChange} />
    </div>
);

const FinancialsTab = ({ data, handleChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Companies House Number" name="financials.companiesHouseNumber" value={data.financials?.companiesHouseNumber} onChange={handleChange} />
        <FormInput label="Financial Year End" name="financials.yearEnd" value={data.financials?.yearEnd} onChange={handleChange} />
        <FormTextarea label="Service Charge Information" name="financials.serviceCharge" value={data.financials?.serviceCharge} onChange={handleChange} />
    </div>
);

const ContractorsTab = ({ data, setFormData }) => {
    const [showAddFieldModal, setShowAddFieldModal] = useState(false);

    const handleContractorChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            contractors: {
                ...prev.contractors,
                [name]: value,
            }
        }));
    };

    const handleAddField = (fieldName) => {
        // Sanitize field name to be a valid object key
        const key = fieldName.toLowerCase().replace(/\s+/g, '');
        if (data.contractors && data.contractors[key]) {
            alert('A contractor field with this name already exists.');
            return;
        }
        setFormData(prev => ({
            ...prev,
            contractors: {
                ...prev.contractors,
                [key]: '',
            }
        }));
    };
    
    const handleDeleteField = (fieldName) => {
       setFormData(prev => {
           const newContractors = { ...prev.contractors };
           delete newContractors[fieldName];
           return { ...prev, contractors: newContractors };
       });
    };

    // Ensure contractors is an object
    const contractors = data.contractors || {};

    return (
        <>
            <AddNewFieldModal show={showAddFieldModal} onClose={() => setShowAddFieldModal(false)} onAddField={handleAddField} />
            <div className="flex flex-wrap gap-6">
                {Object.entries(contractors).map(([key, value]) => (
                    <div key={key} className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor={key} className="block text-sm font-medium text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                            <button onClick={() => handleDeleteField(key)} className="text-gray-400 hover:text-red-600">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <FormTextarea
                            name={key}
                            value={value}
                            onChange={handleContractorChange}
                            placeholder={`Details for ${key}...`}
                        />
                    </div>
                ))}
            </div>
            <div className="mt-6">
                <button onClick={() => setShowAddFieldModal(true)} className="px-4 py-2 text-sm font-semibold text-white bg-[#17A2B8] rounded-lg shadow-sm hover:bg-teal-700 transition">
                    Add Contractor Field
                </button>
            </div>
        </>
    );
};


const DocumentsTab = ({ data, handleFileSelect, handleFileDelete, uploadProgress, fileToUpload, handleUpload, setFileToUpload }) => (
    <div className="space-y-6">
        <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Upload New Document</h4>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-2">1. Select a file</label>
                <input
                    type="file"
                    onChange={handleFileSelect}
                    disabled={uploadProgress > 0}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-[#17A2B8] hover:file:bg-[#17a2b8]/20 cursor-pointer disabled:opacity-50"
                />

                {fileToUpload && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-700">Selected file: <span className="font-medium">{fileToUpload.name}</span></p>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-600 mb-2">2. Confirm upload</label>
                            <button
                                onClick={handleUpload}
                                disabled={uploadProgress > 0}
                                className="px-4 py-2 text-sm font-semibold text-white bg-[#198754] rounded-lg shadow-sm hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-wait"
                            >
                                {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload File'}
                            </button>
                            <button
                                onClick={() => setFileToUpload(null)}
                                disabled={uploadProgress > 0}
                                className="ml-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg shadow-sm hover:bg-gray-300 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                        <div className="bg-[#17A2B8] h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                )}
            </div>
        </div>
        <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Uploaded Documents</h4>
            {data.documents && data.documents.length > 0 ? (
                <ul className="space-y-3">
                    {data.documents.map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[#17A2B8] hover:underline font-medium truncate pr-4">{file.name}</a>
                            <button onClick={() => handleFileDelete(file)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100">
                                <TrashIcon />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-center py-4 ">No documents uploaded for this property.</p>
            )}
        </div>
    </div>
);

// --- MAIN FORM COMPONENT ---
const PropertyForm = ({ property, onSave, onClose, onDelete, onArchive, isSaving, setPrintViewProperty, setNotification, isStaging = false, setStagedData, userRole }) => {
    const [formData, setFormData] = useState(property);
    const [activeTab, setActiveTab] = useState("Core Info");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showFileDeleteConfirm, setShowFileDeleteConfirm] = useState(false);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [fileToDelete, setFileToDelete] = useState(null);
    const isAdmin = userRole === 'admin';

    useEffect(() => {
        setFormData(property);
        if(!isStaging || (property && (!formData || property.id !== formData.id))) {
           setActiveTab("Core Info"); 
        }
    }, [property, isStaging, formData]);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        
        setFormData(prevFormData => {
            const newFormData = JSON.parse(JSON.stringify(prevFormData)); // Deep copy
            
            const keys = name.split('.');
            if (keys.length === 1) {
                newFormData[name] = value;
            } else {
                let current = newFormData;
                for (let i = 0; i < keys.length - 1; i++) {
                    current[keys[i]] = current[keys[i]] ? { ...current[keys[i]] } : {};
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
            }

            if (isStaging) {
                 setStagedData(newFormData);
            }
            return newFormData;
        });
    }, [isStaging, setStagedData]);
    
    const handleFileSelect = (e) => {
        if (e.target.files[0]) {
          setFileToUpload(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!fileToUpload) return;
        
        const file = fileToUpload;
        const storageRef = ref(storage, `documents/${property.id}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload error:", error);
                setNotification({ show: true, title: 'Upload Failed', message: 'There was an error uploading your file. Please try again.'});
                setUploadProgress(0);
                setFileToUpload(null);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    const newFile = { name: file.name, url: downloadURL, path: storageRef.fullPath };
                    const updatedDocuments = [...(formData.documents || []), newFile];
                    const updatedData = { ...formData, documents: updatedDocuments };
                    setFormData(updatedData);
                    onSave(updatedData, true); // Pass flag to prevent generic save notification
                    setUploadProgress(0);
                    setFileToUpload(null);
                    setNotification({ show: true, title: 'Success', message: `Document successfully uploaded.`});
                });
            }
        );
    };

    const triggerFileDelete = (file) => {
        setFileToDelete(file);
        setShowFileDeleteConfirm(true);
    };

    const executeFileDelete = () => {
        if (!fileToDelete) return;

        const fileRef = ref(storage, fileToDelete.path);
        deleteObject(fileRef).then(() => {
            const updatedDocuments = formData.documents.filter(doc => doc.path !== fileToDelete.path);
            const updatedData = { ...formData, documents: updatedDocuments };
            setFormData(updatedData);
            onSave(updatedData);
            setNotification({ show: true, title: 'Success', message: `File "${fileToDelete.name}" deleted.`});
        }).catch(error => {
            console.error("Error deleting file:", error);
            setNotification({ show: true, title: 'Error', message: 'Failed to delete the file.'});
        }).finally(() => {
            setShowFileDeleteConfirm(false);
            setFileToDelete(null);
        });
    };

    const renderActiveTab = () => {
        const props = {
            data: formData,
            handleChange: handleFormChange,
            setFormData: setFormData,
            handleFileSelect: handleFileSelect,
            handleUpload: handleUpload,
            handleFileDelete: triggerFileDelete,
            uploadProgress: uploadProgress,
            fileToUpload: fileToUpload,
            setFileToUpload: setFileToUpload,
        };
        switch (activeTab) {
            case "Core Info": return <CoreInfoTab {...props} />;
            case "Contacts": return <ContactsTab {...props} />;
            case "Site Details": return <SiteDetailsTab {...props} />;
            case "Periodic Tests": return <PeriodicTestsTab {...props} />;
            case "Utilities": return <UtilitiesTab {...props} />;
            case "Key Systems": return <KeySystemsTab {...props} />;
            case "Insurance": return <InsuranceTab {...props} />;
            case "Financials": return <FinancialsTab {...props} />;
            case "Contractors": return <ContractorsTab {...props} />;
            case "Documents": return <DocumentsTab {...props} />;
            default: return <CoreInfoTab {...props} />;
        }
    };
    
    if (!formData) return <div className="p-8 text-center text-gray-500">Select a property to view its details.</div>;

    return (
        <div className="bg-white h-full flex flex-col">
            <ConfirmationModal
                show={showFileDeleteConfirm}
                onClose={() => setShowFileDeleteConfirm(false)}
                onConfirm={executeFileDelete}
                title="Confirm File Deletion"
                message={`Are you sure you want to permanently delete the file "${fileToDelete?.name}"? This action cannot be undone.`}
            />
            <div className="flex-grow flex flex-row overflow-y-auto">
                <nav className="w-48 border-r border-gray-200 p-2 space-y-1 bg-white overflow-y-auto shrink-0">
                    {formTabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left py-2 px-3 rounded-md font-medium text-sm transition-colors
                                ${activeTab === tab
                                    ? 'bg-teal-50 text-teal-700'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
                <div className="flex-grow p-6 overflow-y-auto bg-gray-50">
                    {renderActiveTab()}
                </div>
            </div>

            {!isStaging && (
                <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-white">
                    {isAdmin && (
                        <button onClick={() => onArchive(formData)} className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-colors ${formData.archived ? 'bg-[#17A2B8] hover:bg-teal-700' : 'bg-[#FD7E14] hover:bg-orange-600'}`}>
                            {formData.archived ? 'Restore Property' : 'Archive Property'}
                        </button>
                    )}
                     <div className="flex items-center gap-2">
                         <button onClick={() => setPrintViewProperty(formData)} className="px-4 py-2 text-sm font-semibold text-white bg-[#6C757D] rounded-lg shadow-sm hover:bg-gray-600 transition-all">
                            Print
                        </button>
                        {isAdmin && (
                            <>
                                <button onClick={() => onSave(formData)} disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-white bg-[#17A2B8] rounded-lg shadow-sm hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all">
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button onClick={() => onDelete(formData.id)} className="px-4 py-2 text-sm font-semibold text-white bg-[#DC3545] rounded-lg shadow-sm hover:bg-red-700 transition-colors">
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


// --- VIEWS ---

const PropertyCard = ({ property, onSelect }) => (
    <div 
        className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group border hover:border-[#17A2B8] ${property.archived ? 'italic opacity-70' : ''}`}
        onClick={() => onSelect(property)}
    >
        <div className="bg-[#343a40] p-4">
            <h3 className="text-lg font-bold text-white truncate group-hover:text-[#0DCAF0]">{property.name}</h3>
        </div>
        <div className="p-4 flex-grow">
            <p className="text-sm text-gray-600 line-clamp-2">{property.address}</p>
        </div>
        <div className="p-4 mt-auto border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">{property.units || 'No unit info'}</span>
            {property.archived && <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full line-through">ARCHIVED</span>}
        </div>
    </div>
);


const GridView = ({ properties, onSelectProperty }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
        {properties.map(p => (
            <PropertyCard key={p.id} property={p} onSelect={onSelectProperty} />
        ))}
    </div>
);

const ListView = ({ properties, onSelectProperty, selectedProperty, onSave, onClose, onDelete, onArchive, isSaving, setPrintViewProperty, setNotification, userRole }) => (
    <div className="flex h-full bg-gray-50">
        <div className="w-1/3 max-w-sm border-r border-gray-200 overflow-y-auto bg-white">
            <ul className="p-2 space-y-2">
                {properties.map(p => (
                    <li 
                        key={p.id} 
                        onClick={() => onSelectProperty(p)} 
                        className={`p-4 cursor-pointer transition-all duration-200 rounded-lg border-2 ${selectedProperty?.id === p.id ? 'bg-white border-[#17A2B8] shadow-md' : 'bg-white border-transparent hover:shadow-sm hover:border-gray-200'} ${p.archived ? 'italic opacity-70' : ''}`}
                    >
                        <div className="flex justify-between items-start">
                           <p className={`font-semibold ${selectedProperty?.id === p.id ? 'text-[#17A2B8]' : 'text-gray-800'}`}>{p.name}</p>
                            {p.archived && <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full line-through">ARCHIVED</span>}
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">{p.address}</p>
                         <div className="pt-2 mt-2 border-t border-gray-100">
                           <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">{p.units || 'No unit info'}</span>
                         </div>
                    </li>
                ))}
            </ul>
        </div>
        <div className="w-2/3 flex-grow">
             {selectedProperty ? (
                <PropertyForm 
                    property={selectedProperty} 
                    onSave={onSave}
                    onClose={onClose}
                    onDelete={onDelete}
                   // eslint-disable-next-line no-undef
				onArchive={confirmArchive}
                    isSaving={isSaving}
                    setPrintViewProperty={setPrintViewProperty}
                    setNotification={setNotification}
                    userRole={userRole}
                />
            ) : (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <h3 className="mt-2 text-lg font-medium text-gray-700">No property selected</h3>
                        <p className="mt-1 text-sm text-gray-500">Select a property from the list to view its details.</p>
                    </div>
                </div>
            )}
        </div>
    </div>
);

// --- PRINT VIEW ---
const PrintView = ({ property, onExit }) => {
    
    const Section = ({ title, children }) => (
        <div className="mb-4 break-inside-avoid">
            <h3 className="text-lg font-bold border-b-2 border-black pb-1 mb-2">{title}</h3>
            <div className="text-sm">{children}</div>
        </div>
    );
    
    const DataPair = ({ label, value }) => value ? (
        <div className="flex mb-1">
            <p className="font-bold w-1/3 shrink-0">{label}:</p>
            <p className="w-2/3 whitespace-pre-wrap">{value}</p>
        </div>
    ) : null;

    if (!property) return null;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .print-hide { display: none !important; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            ` }} />
            <div className="print-view fixed inset-0 bg-white z-[200] p-8 font-sans overflow-y-auto">
                 <div className="print-hide flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                         <h1 className="text-2xl font-bold">Print Preview</h1>
                         <p className="text-sm text-gray-600 mt-1">To print, press <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Ctrl+P</kbd> (or <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Cmd+P</kbd> on Mac).</p>
                    </div>
                    <button onClick={onExit} className="px-6 py-2 rounded-lg bg-[#6C757D] text-white font-semibold hover:opacity-90 transition shadow-sm">
                        Exit Print View
                    </button>
                </div>
                
                <div className="print-view-content">
                    <div className="text-center mb-6">
                         <h1 className="text-3xl font-extrabold mb-1">{property.name} - Property Access Sheet</h1>
                         <p className="text-lg font-medium">{property.address}</p>
                    </div>
        
                    <div className="space-y-4">
                        <Section title="Core Information">
                            <DataPair label="Units" value={property.units} />
                        </Section>
                        
                        <Section title="Emergency & On-site Contacts">
                            <DataPair label="Directors" value={property.contacts?.directors} />
                            <DataPair label="Emergency" value={property.contacts?.emergency} />
                            <DataPair label="On-site" value={property.contacts?.onSite} />
                        </Section>
        
                        <Section title="Access & Site Details">
                            <DataPair label="Entry System" value={property.siteDetails?.entrySystem} />
                            <DataPair label="Key Safe Codes" value={property.siteDetails?.keySafe} />
                            <DataPair label="Water Stop-Cock" value={property.siteDetails?.waterStopCock} />
                             <DataPair label="Meters" value={property.utilities?.meters} />
                             <DataPair label="Refuse Info" value={property.siteDetails?.refuseInfo} />
                        </Section>
                                     
                         <Section title="Key System Details">
                            <DataPair label="Fire Panel" value={property.keySystems?.firePanel} />
                            <DataPair label="Pumps" value={property.keySystems?.pumps} />
                            <DataPair label="Lifts" value={property.keySystems?.lifts} />
                            <DataPair label="Electric Gates" value={property.keySystems?.electricGates} />
                        </Section>
    
                        <Section title="Key Contractors">
                            <DataPair label="Cleaners" value={property.contractors?.cleaners} />
                            <DataPair label="Gardeners" value={property.contractors?.gardeners} />
                            <DataPair label="Preferred" value={property.contractors?.preferred} />
                        </Section>
                    </div>
                </div>
            </div>
        </>
    );
};

const PropertyImporter = ({ show, onClose, liveProperties, handleSeedDatabase, setNotification }) => {
    const [stagedProperties, setStagedProperties] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [pastedText, setPastedText] = useState('');
    const [processedProperty, setProcessedProperty] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [importerNotification, setImporterNotification] = useState({ show: false, title: '', message: ''});
    const [showImportConfirm, setShowImportConfirm] = useState(false);
    const [propertiesToImport, setPropertiesToImport] = useState(null);

    const handleProcessText = () => {
        if(!pastedText.trim()) return;
        setIsProcessing(true);

        setTimeout(() => {
            let lines = pastedText.split('\n').filter(line => line.trim() !== '');
            let data = JSON.parse(JSON.stringify(newPropertyTemplate)); // Deep copy to get all nested objects
            data.id = Date.now();

            const nameLineIndex = lines.findIndex(line => line.toLowerCase().startsWith('development name:'));
            
            if (nameLineIndex !== -1) {
                data.name = lines.splice(nameLineIndex, 1)[0].substring(17).trim();
            } else {
                 data.name = `New Property ${Date.now()}`;
            }

            let otherData = [];
            
            const fieldMapping = {
                'address': 'address', 'units': 'units', 'directors': 'contacts.directors',
                'emergency': 'contacts.emergency', 'on-site contact': 'contacts.onSite', 'entry system': 'siteDetails.entrySystem',
                'key safe': 'siteDetails.keySafe', 'water stop-cock': 'siteDetails.waterStopCock', 'refuse information': 'siteDetails.refuseInfo',
                'fixed wiring': 'periodicTests.fixedWiring', 'fire risk assessment': 'periodicTests.fireRiskAssessment',
                'insurance revaluation': 'periodicTests.insuranceRevaluation', 'legionnaires': 'periodicTests.legionnaires',
                'asbestos survey': 'periodicTests.asbestosSurvey', 'landlord supply': 'utilities.landlordSupply',
                'meters': 'utilities.meters', 'fire panel': 'keySystems.firePanel', 'emergency lighting': 'keySystems.emergencyLighting',
                'smoke vents': 'keySystems.smokeVents', 'pumps': 'keySystems.pumps', 'lifts': 'keySystems.lifts',
                'electric gates': 'keySystems.electricGates', 'monitoring': 'keySystems.monitoring', 'cctv': 'keySystems.cctv',
                'phone lines': 'keySystems.phoneLines', 'provider': 'insurance.provider', 'renewal date': 'insurance.renewalDate',
                'reinstatement value': 'insurance.reinstatementValue', 'companies house number': 'financials.companiesHouseNumber',
                'year end': 'financials.yearEnd', 'service charge': 'financials.serviceCharge', 'cleaners': 'contractors.cleaners',
                'gardeners': 'contractors.gardeners', 'preferred': 'contractors.preferred', 'roofing': 'contractors.roofing',
                'television/sky': 'contractors.televisionSky', 'door entry': 'contractors.doorEntry', 'door systems': 'contractors.doorSystems',
                'alarm & eml': 'contractors.alarmAndEml', 'bt/broadband': 'contractors.bt', 'electrician': 'contractors.electrician',
                'plumbers': 'contractors.plumbers', 'fire extinguishers': 'contractors.fireExtinguishers',
            };

            let currentKey = null;
            let currentPath = null;
            let multiLineContent = [];

            lines.forEach(line => {
                let matchedKey = null;
                for (const key in fieldMapping) {
                    if (line.toLowerCase().startsWith(key + ':')) {
                        matchedKey = key;
                        break;
                    }
                }

                if (matchedKey) {
                    if (currentKey) {
                         const keys = currentPath.split('.');
                         let obj = data;
                         for (let i = 0; i < keys.length - 1; i++) { obj = obj[keys[i]]; }
                         obj[keys[keys.length - 1]] = multiLineContent.join('\n');
                    }
                    currentKey = matchedKey;
                    currentPath = fieldMapping[matchedKey];
                    multiLineContent = [line.substring(matchedKey.length + 1).trim()];
                } else if (currentKey) {
                    multiLineContent.push(line.trim());
                } else {
                    otherData.push(line);
                }
            });
            
            if (currentKey) {
                const keys = currentPath.split('.');
                let obj = data;
                for (let i = 0; i < keys.length - 1; i++) { obj = obj[keys[i]]; }
                obj[keys[keys.length - 1]] = multiLineContent.join('\n');
            }
            
            if (otherData.length > 0 && !data.address) {
                data.address = otherData.join('\n');
            } else if (otherData.length > 0) {
                data.siteDetails.siteInfo = (data.siteDetails.siteInfo ? data.siteDetails.siteInfo + '\n' : '') + otherData.join('\n');
            }
            
            setProcessedProperty(data);
            setIsProcessing(false);
            setPastedText('');
            setSelectedIndex(null);
        }, 500);
    };


    const handleUpdateStagedProperty = (updatedProperty) => {
        if (processedProperty) {
            setProcessedProperty(updatedProperty);
        } else if (selectedIndex !== null) {
            const newStagedProperties = [...stagedProperties];
            newStagedProperties[selectedIndex] = updatedProperty;
            setStagedProperties(newStagedProperties);
        }
    };

    const handleAddToStaging = () => {
        if (!processedProperty) return;
        setStagedProperties([...stagedProperties, processedProperty]);
        setProcessedProperty(null);
    }
    
    const handleGenerateJson = () => {
        const livePropertyNames = new Set(liveProperties.map(p => p.name.toLowerCase()));
        const newProperties = stagedProperties.filter(p => !livePropertyNames.has(p.name.toLowerCase()));

        if (newProperties.length === 0) {
            setImporterNotification({ show: true, title: "No New Properties", message: "All properties in the staging list already exist in the database or the list is empty." });
            return;
        }

        const jsonString = JSON.stringify(newProperties, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "properties_for_import.json";
        a.click();
        URL.revokeObjectURL(url);

        setImporterNotification({ show: true, title: "Success", message: `${newProperties.length} properties compiled and downloaded.` });
    };

    const handleDeleteStagedProperty = (index) => {
        const newStagedProperties = [...stagedProperties];
        newStagedProperties.splice(index, 1);
        setStagedProperties(newStagedProperties);
        if (selectedIndex === index) {
            setSelectedIndex(null);
            setProcessedProperty(null);
        } else if (selectedIndex > index) {
            setSelectedIndex(selectedIndex - 1);
        }
    };
    
    const handleJsonFileSelectInternal = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    const livePropertyNames = new Set(liveProperties.map(p => p.name.toLowerCase()));
                    const newProperties = importedData.filter(p => !livePropertyNames.has(p.name.toLowerCase()));
                    const skippedProperties = importedData.filter(p => livePropertyNames.has(p.name.toLowerCase()));
                    
                    setPropertiesToImport({
                        new: newProperties,
                        skipped: skippedProperties
                    });
                    setShowImportConfirm(true);

                } catch (error) {
                    setImporterNotification({show: true, title: "Import Error", message: "Could not parse JSON file. Please ensure it is correctly formatted."});
                }
            };
            reader.readAsText(file);
        } else {
             setImporterNotification({show: true, title: "Invalid File", message: "Please select a valid .json file."});
        }
        event.target.value = null; // Reset file input
    };

    const selectedPropertyForForm = processedProperty || (selectedIndex !== null ? stagedProperties[selectedIndex] : null);

    if (!show) return null;

    return (
        <Modal show={show} onClose={onClose} title="Property Importer" maxWidth="max-w-7xl">
             <NotificationModal
                show={importerNotification.show}
                onClose={() => setImporterNotification({ show: false, title: '', message: '' })}
                title={importerNotification.title}
                message={importerNotification.message}
            />
             {showImportConfirm && propertiesToImport && (
                 <ConfirmationModal 
                    show={showImportConfirm}
                    onClose={() => setShowImportConfirm(false)}
                    onConfirm={async () => { 
                        setShowImportConfirm(false);
                        await handleSeedDatabase(propertiesToImport.new, false); 
                        setImporterNotification({show: true, title: "Import Complete", message: `Successfully imported ${propertiesToImport.new.length} properties.`}) 
                    }}
                    title="Confirm Import"
                    message={
                        `You are about to import ${propertiesToImport.new.length} new properties. ${propertiesToImport.skipped.length > 0 ? `${propertiesToImport.skipped.length} properties were skipped because they already exist.` : ''} Do you want to continue?`
                    }
                    confirmButtonClass="bg-[#17A2B8] hover:bg-teal-700"
                    confirmText="Import Properties"
                />
            )}
            <div className="p-4 bg-blue-50 border-b border-blue-200 text-blue-800" role="alert">
                <p className="font-bold">Welcome to the Property Importer</p>
                <p className="text-sm">This tool will not change your live data. Use it to prepare a list of new properties. When you're finished, you can download a file to import them later.</p>
            </div>
            <div className="flex h-[calc(100%-120px)]">
                <div className="w-1/3 max-w-sm border-r border-gray-200 overflow-y-auto p-2">
                    <div className="p-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paste Property Data Here</label>
                        <textarea
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            rows={8}
                            className="w-full p-2 border rounded-md"
                            placeholder="Copy and paste unstructured property data here..."
                        />
                        <button onClick={handleProcessText} disabled={isProcessing} className="w-full mt-2 px-4 py-2 text-sm font-semibold text-white bg-[#17A2B8] rounded-lg shadow-sm hover:bg-teal-700 transition disabled:bg-gray-400">
                           {isProcessing ? 'Processing...' : 'Process Pasted Text'}
                        </button>
                    </div>
                     <hr className="my-4"/>
                    <div className="flex justify-between items-center p-2">
                        <h4 className="font-bold">Staging List</h4>
                        {processedProperty && (
                             <button onClick={handleAddToStaging} className="px-4 py-1 text-sm font-semibold text-white bg-[#17A2B8] rounded-lg shadow-sm hover:bg-teal-700 transition">
                                Add to Staging List
                            </button>
                        )}
                    </div>
                    <ul>
                        {stagedProperties.map((p, index) => (
                           <li key={p.id} onClick={() => { setSelectedIndex(index); setProcessedProperty(null); }} className={`flex justify-between items-center p-3 cursor-pointer rounded-lg ${selectedIndex === index && !processedProperty ? 'bg-teal-100' : 'hover:bg-gray-100'}`}>
                                <p className="font-semibold text-gray-800">{p.name}</p>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteStagedProperty(index)}} className="text-gray-400 hover:text-red-600 p-1 rounded-full">
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                           </li>
                        ))}
                    </ul>
                </div>
                <div className="w-2/3 flex-grow flex flex-col">
                    {selectedPropertyForForm ? (
                        <PropertyForm 
                            property={selectedPropertyForForm}
                            isStaging={true}
                            setStagedData={handleUpdateStagedProperty}
                        />
                    ) : (
                         <div className="flex items-center justify-center h-full bg-gray-50">
                            <div className="text-center p-4">
                                <h3 className="mt-2 text-lg font-medium text-gray-700">Ready to Compile</h3>
                                <p className="mt-1 text-sm text-gray-500">Paste property details on the left and click "Process" to begin staging a new property.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-4">
                <button onClick={handleGenerateJson} className="px-6 py-3 font-semibold text-white bg-[#17A2B8] rounded-lg shadow-sm hover:bg-teal-700">
                    Validate & Export
                </button>
                <input type="file" id="json-importer-modal" className="hidden" accept=".json" onChange={handleJsonFileSelectInternal} />
                <label htmlFor="json-importer-modal" className="cursor-pointer px-6 py-3 font-semibold text-white bg-[#17A2B8] rounded-lg shadow-sm hover:bg-teal-700 transition">
                    Import
                </label>
            </div>
        </Modal>
    )
}

// --- APP COMPONENT ---
export default function App() {
    // State management
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isSeeding, setIsSeeding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [view, setView] = useState('grid');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [modalProperty, setModalProperty] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [showSeedButton, setShowSeedButton] = useState(false);
    
    // Modals
    const [showUserGuide, setShowUserGuide] = useState(false);
    const [showSecurity, setShowSecurity] = useState(false);
    const [showCompiler, setShowCompiler] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState(null);
    const [propertyToArchive, setPropertyToArchive] = useState(null);
    const [printViewProperty, setPrintViewProperty] = useState(null);
    const [notification, setNotification] = useState({ show: false, title: '', message: '' });


    // --- AUTHENTICATION EFFECT ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && !user.isAnonymous) {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    setUserRole(userDocSnap.data().role);
                } else {
                    try {
                        await setDoc(userDocRef, { role: 'user', email: user.email, createdAt: new Date().toISOString() });
                        setUserRole('user');
                    } catch (error) {
                        console.error("Error creating user document:", error)
                    }
                }
                setUser(user);
                setIsAuthReady(true);
            } else {
                setUser(null);
                setUserRole(null);
                setIsAuthReady(true);
            }
        });
        return () => unsubscribe();
    }, []);

    // --- DATA FETCHING EFFECT ---
    useEffect(() => {
        if (!isAuthReady || !user) {
            setIsLoading(false);
            return;
        };

        setIsLoading(true);
        const unsubscribe = onSnapshot(propertiesCollectionRef, (snapshot) => {
            const propertiesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setProperties(propertiesData);
            setShowSeedButton(propertiesData.length === 0);
            setIsLoading(false);
        }, (error) => {
            console.error("Firestore Snapshot Error:", error);
            setNotification({ show: true, title: "Database Error", message: "Could not fetch data from the database. Check console for details."});
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthReady, user]);
    
    // --- SEEDING/IMPORTING FUNCTIONS ---
    const handleSeedDatabase = async (propertiesToSeed, showNotification = true) => {
        setIsSeeding(true);
        
        const propertiesToProcess = propertiesToSeed || initialPropertiesData;

        try {
            const querySnapshot = await getDocs(propertiesCollectionRef);
            const existingNames = new Set(querySnapshot.docs.map(doc => doc.data().name.toLowerCase()));
            
            const propertiesToAdd = propertiesToProcess.filter(p => !existingNames.has(p.name.toLowerCase()));
            
            if (propertiesToAdd.length === 0) {
                if(showNotification){
                    setNotification({show: true, title: "No New Properties", message: "All properties in the source already exist in the database."});
                }
                setIsSeeding(false);
                return;
            }

            const batch = writeBatch(db);
            propertiesToAdd.forEach(property => {
                const {id, ...propertyData} = property;
                const docRef = doc(propertiesCollectionRef);
                batch.set(docRef, propertyData);
            });
            await batch.commit();
            if(showNotification) {
                setNotification({show: true, title: "Success", message: `Successfully seeded ${propertiesToAdd.length} new properties.`});
            }
        } catch (error) {
            console.error("Error seeding database: ", error);
             if(showNotification){
                setNotification({show: true, title: "Seeding Error", message: "An error occurred while seeding the database. Check console for details."});
            }
        }
        setIsSeeding(false);
    };
    

    // CRUD operations
    const handleAddProperty = async () => {
        try {
            const newProp = { ...newPropertyTemplate, id: Date.now().toString(), createdAt: new Date().toISOString() };
            const docRef = await addDoc(propertiesCollectionRef, newProp);
            const newPropertyWithId = { ...newProp, id: docRef.id };

            if (view === 'grid') {
                setModalProperty(newPropertyWithId);
            } else {
                setSelectedProperty(newPropertyWithId);
            }
        } catch (error) {
            console.error("Error adding property: ", error);
            setNotification({ show: true, title: "Error", message: "Failed to add new property."});
        }
    };
    
    const handleSaveProperty = async (propertyData, fromUpload = false) => {
        setIsSaving(true);
        const { id, ...dataToSave } = propertyData;
        try {
            const propertyRef = doc(db, 'properties', id);
            await updateDoc(propertyRef, dataToSave);
            if (!fromUpload) {
                setNotification({ show: true, title: "Saved", message: `Changes to ${propertyData.name} have been saved.`});
            }
        } catch (error) {
            console.error("Error updating property: ", error);
            setNotification({ show: true, title: "Error", message: "Failed to save changes."});
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProperty = async (id) => {
       setShowDeleteConfirm(false);
       if (!id) return;

       // Also delete associated files from storage
       const property = properties.find(p => p.id === id);
       if(property && property.documents && property.documents.length > 0) {
           for(const docFile of property.documents){
               const fileRef = ref(storage, docFile.path);
               try {
                 await deleteObject(fileRef);
               } catch (error) {
                 console.warn(`Could not delete file ${docFile.path}. It may have already been removed.`, error);
               }
           }
       }
       
       await deleteDoc(doc(db, 'properties', id));
       setNotification({ show: true, title: "Deleted", message: `Property "${property.name}" has been permanently deleted.`});
       
       setSelectedProperty(null);
       setModalProperty(null);
    };

    const handleArchiveProperty = async (property) => {
        setShowArchiveConfirm(false);
        if(!property) return;
        const newArchivedState = !property.archived;
        const updatedProperty = { ...property, archived: newArchivedState };
        
        // Optimistically update the UI
        if (selectedProperty && selectedProperty.id === property.id) {
            setSelectedProperty(updatedProperty);
        }
        if (modalProperty && modalProperty.id === property.id) {
            setModalProperty(updatedProperty);
        }

        // Save to backend and show notification
        await handleSaveProperty(updatedProperty, true); // Suppress generic save message
        setNotification({ show: true, title: "Success", message: `Property ${updatedProperty.name} has been ${newArchivedState ? 'archived' : 'restored'}.`});
    };

    const confirmDelete = (id) => {
        setPropertyToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmArchive = (property) => {
        setPropertyToArchive(property);
        setShowArchiveConfirm(true);
    };
    
    // Filtering and sorting logic
    const filteredProperties = useMemo(() => {
        return [...properties] // Create a shallow copy to avoid mutating the original state
            .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
            .filter(p => showArchived || !p.archived)
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [properties, showArchived, searchTerm]);

    const handleSelectProperty = (property) => {
        if (view === 'grid') {
            setModalProperty(property);
        } else {
            setSelectedProperty(property);
        }
    };
    
    const handleCloseForm = () => {
        setSelectedProperty(null);
        setModalProperty(null);
    };

    const handleSignOut = () => {
        signOut(auth);
    }
    
    if (!isAuthReady) {
        return <LoadingSpinner />
    }

    if (!user) {
        return <LoginScreen setNotification={setNotification} />;
    }

    if (printViewProperty) {
        return <PrintView property={printViewProperty} onExit={() => setPrintViewProperty(null)} />;
    }

    return (
        <div className="bg-gray-100 h-screen w-screen flex flex-col font-sans text-gray-800">
            {/* --- Modals --- */}
            <Modal show={modalProperty !== null} onClose={handleCloseForm} title={modalProperty?.name || "Edit Property"}>
                {modalProperty && 
                    <PropertyForm 
                        property={modalProperty} 
                        onSave={handleSaveProperty}
                        onClose={handleCloseForm}
                        onDelete={confirmDelete}
                        onArchive={confirmArchive}
                        isSaving={isSaving}
                        setPrintViewProperty={setPrintViewProperty}
                        setNotification={setNotification}
                        userRole={userRole}
                    />
                }
            </Modal>
            
            <ConfirmationModal 
                show={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => handleDeleteProperty(propertyToDelete)}
                title="Confirm Deletion"
                message="Are you sure you want to permanently delete this property and all its documents? This action cannot be undone."
                confirmButtonClass="bg-[#DC3545] hover:bg-red-700"
                confirmText="Delete"
            />
            
            <ConfirmationModal 
                show={showArchiveConfirm}
                onClose={() => setShowArchiveConfirm(false)}
                onConfirm={() => handleArchiveProperty(propertyToArchive)}
                title={propertyToArchive?.archived ? 'Confirm Restore' : 'Confirm Archive'}
                message={`Are you sure you want to ${propertyToArchive?.archived ? 'restore' : 'archive'} the property "${propertyToArchive?.name}"?`}
                confirmButtonClass={propertyToArchive?.archived ? 'bg-[#17A2B8] hover:bg-teal-700' : 'bg-[#FD7E14] hover:bg-orange-600'}
                confirmText={propertyToArchive?.archived ? 'Restore' : 'Archive'}
            />

            <NotificationModal 
                show={notification.show}
                onClose={() => setNotification({ show: false, title: '', message: '' })}
                title={notification.title}
                message={notification.message}
            />

            <Modal show={showUserGuide} onClose={() => setShowUserGuide(false)} title="User Guide & SOP" maxWidth="max-w-3xl">
                <div className="p-6 prose max-w-none">
                    <h2>Standard Operating Procedures</h2>
                    <h4>Adding a Property:</h4>
                    <p>Click the "Add Property" button. A new property form will appear. Fill in the details across the various tabs and click "Save Changes".</p>
                    <h4>Editing a Property:</h4>
                    <p>In Grid View, click on a property card. In List View, select a property from the list. The details form will appear. Make your changes and click "Save Changes". The application saves your progress automatically in many cases, but clicking Save ensures all data is committed.</p>
                    <h4>Searching:</h4>
                    <p>Use the search bar to filter properties by name in real-time.</p>
                    <h4>Archiving:</h4>
                    <p>To hide a property without deleting it, open its form and click "Archive Property". To view archived properties, check the "Show Archived" box. You can then restore an archived property by opening its form and clicking "Restore Property".</p>
                    <h4>Deleting a Property:</h4>
                    <p>Open the property's form and click "Delete Permanently". You will be asked for confirmation. <strong>This action is irreversible and will delete all associated data and documents.</strong></p>
                    <h4>Managing Documents:</h4>
                    <p>In the "Documents" tab of a property's form, you can upload new files and delete existing ones. Files are stored securely in Firebase Storage.</p>
                    <h4>Printing:</h4>
                    <p>Click the "Print" button within a property's form to generate a clean, printable "Property Access Sheet" with key information for contractors and on-site personnel.</p>
                </div>
            </Modal>
            
            <Modal show={showSecurity} onClose={() => setShowSecurity(false)} title="Security & GDPR Compliance" maxWidth="max-w-3xl">
                 <div className="p-6 prose max-w-none">
                    <h2>Data Security and Compliance</h2>
                    <p>This application is built with security as a top priority, leveraging Google Firebase's robust infrastructure.</p>
                    <ul>
                        <li><strong>Data Encryption:</strong> All data, both in transit and at rest on Firebase servers, is encrypted using industry-standard protocols.</li>
                        <li><strong>Secure Access:</strong> Access to the Firebase backend is restricted by security rules, ensuring that only authorized requests can read or write data.</li>
                        <li><strong>Firebase Storage:</strong> All uploaded documents are stored in a secure Firebase Storage bucket, governed by its own set of security rules.</li>
                        <li><strong>GDPR Compliance:</strong> The application architecture supports GDPR principles. Data is stored for specified and legitimate purposes. Users (administrators) have full control to access, update, and delete property and personal data, fulfilling the "Right to Rectification" and "Right to Erasure".</li>
                        <li><strong>No Sensitive Data:</strong> We advise against storing highly sensitive personal data (e.g., bank details, government IDs) in plain text fields. Use the secure document upload for sensitive records where necessary.</li>
                    </ul>
                </div>
            </Modal>

            <PropertyImporter 
                show={showCompiler} 
                onClose={() => setShowCompiler(false)} 
                liveProperties={properties}
                handleSeedDatabase={handleSeedDatabase}
                setNotification={setNotification}
            />


            {/* --- Main UI --- */}
            <header className="bg-[#343a40] text-gray-200 shadow-md">
                <div className="p-4 mx-auto max-w-screen-2xl">
                    {/* Top Row */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                            <h1 className="text-2xl md:text-3xl font-bold">Property Management Database</h1>
                             <span className="ml-4 text-sm font-medium bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
                                {filteredProperties.length} / {properties.length} properties
                            </span>
                        </div>
                        <div className="flex items-center gap-2 md:gap-6">
                             <button onClick={() => setShowCompiler(true)} className="flex items-center gap-2 hover:text-white transition-colors p-2 rounded-md hover:bg-white/10">
                                <WrenchScrewdriverIcon className="w-5 h-5" />
                                <span className="text-sm font-medium hidden md:block">Tools</span>
                            </button>
                            <button onClick={() => setShowSecurity(true)} className="flex items-center gap-2 hover:text-white transition-colors p-2 rounded-md hover:bg-white/10">
                                <ShieldCheckIcon className="w-5 h-5" />
                                <span className="text-sm font-medium hidden md:block">Security</span>
                            </button>
                            <button onClick={() => setShowUserGuide(true)} className="flex items-center gap-2 hover:text-white transition-colors p-2 rounded-md hover:bg-white/10">
                                <QuestionMarkCircleIcon className="w-5 h-5" />
                                <span className="text-sm font-medium hidden md:block">User Guide</span>
                            </button>
                             <button onClick={handleSignOut} className="flex items-center gap-2 hover:text-white transition-colors p-2 rounded-md hover:bg-white/10">
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                <span className="text-sm font-medium hidden md:block">Sign Out</span>
                            </button>
                        </div>
                    </div>
                    {/* Bottom Row */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-auto md:flex-grow max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                               <MagnifyingGlassIcon className="w-5 h-5 text-gray-400"/>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by property name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-500 rounded-lg bg-[#495057] text-white focus:ring-2 focus:ring-[#0DCAF0] focus:border-[#0DCAF0] placeholder-gray-400"
                            />
                        </div>
                        <div className="flex items-center gap-4 flex-wrap justify-end">
                            <div className="flex items-center">
                                <input
                                    id="showArchived"
                                    type="checkbox"
                                    checked={showArchived}
                                    onChange={(e) => setShowArchived(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-400 bg-gray-700 text-[#17A2B8] focus:ring-[#17A2B8] focus:ring-offset-gray-800"
                                />
                                <label htmlFor="showArchived" className="ml-2 block text-sm font-medium">Show Archived</label>
                            </div>
                            <div className="flex items-center bg-gray-700 rounded-lg p-1">
                                <button onClick={() => setView('grid')} className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-[#0DCAF0] text-white' : 'text-gray-300 hover:bg-white/10'}`}>
                                    <Squares2x2Icon />
                                </button>
                                <button onClick={() => setView('list')} className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-[#0DCAF0] text-white' : 'text-gray-300 hover:bg-white/10'}`}>
                                   <ListBulletIcon />
                                </button>
                            </div>
                            {userRole === 'admin' && (
                                <button onClick={handleAddProperty} disabled={!isAuthReady} className="flex items-center px-6 py-3 text-sm font-semibold text-white bg-[#17A2B8] rounded-lg shadow-sm hover:bg-teal-600 transition disabled:bg-gray-500 disabled:cursor-not-allowed">
                                    <PlusIcon/>
                                    Add Property
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-grow overflow-auto relative">
                 {showSeedButton && userRole === 'admin' && (
                    <div className="absolute top-4 right-4 z-10">
                        <button onClick={() => handleSeedDatabase()} disabled={isSeeding || !isAuthReady} className="px-3 py-2 text-sm font-semibold text-white bg-[#6F42C1] rounded-lg shadow-sm hover:bg-violet-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isSeeding ? 'Seeding...' : 'Seed Database'}
                        </button>
                    </div>
                 )}
                {isLoading ? (
                    <LoadingSpinner />
                ) : view === 'grid' ? (
                    <GridView properties={filteredProperties} onSelectProperty={handleSelectProperty} />
                ) : (
                    <ListView 
                        properties={filteredProperties} 
                        selectedProperty={selectedProperty}
                        onSelectProperty={handleSelectProperty}
                        onSave={handleSaveProperty}
                        onClose={handleCloseForm}
                        onDelete={confirmDelete}
                        onArchive={confirmArchive}
                        isSaving={isSaving}
                        setPrintViewProperty={setPrintViewProperty}
                        setNotification={setNotification}
                        userRole={userRole}
                    />
                )}
            </main>
        </div>
    );
}

const LoginScreen = ({ setNotification }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle the rest
        } catch (error) {
            console.error("Sign in error", error);
            setError("Invalid email or password. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSignIn}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1">
                                <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
                                {isSubmitting ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
