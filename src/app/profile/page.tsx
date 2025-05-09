'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { UserProfile } from '@/types/userTypes';
import { saveUserData } from '@/utils/firebaseHelpers';
import { FiEdit2, FiSave, FiX, FiCheck } from 'react-icons/fi';
import { HiOutlineOfficeBuilding, HiOutlineGlobe, HiOutlineTag, HiOutlineUserGroup, HiOutlineCalendar, HiOutlineLocationMarker } from 'react-icons/hi';
import { MdOutlineBusinessCenter } from 'react-icons/md';
import { BsGraphUp } from 'react-icons/bs';
import { TbTarget } from 'react-icons/tb';
import { IoIosTime } from 'react-icons/io';
import { toast } from 'react-hot-toast';

// Add this CSS at the top of the file
const ThemeIcon = ({ theme }: { theme: string }) => (
    <div className="relative w-5 h-5">
        {/* Sun icon */}
        <div 
            className={`
                absolute inset-0 transform transition-all duration-500 ease-in-out
                ${theme === 'dark' 
                    ? 'rotate-[360deg] scale-0 translate-y-10 opacity-0' 
                    : 'rotate-0 scale-100 translate-y-0 opacity-100'
                }
            `}
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor"
                className="transform-gpu"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="transform origin-center transition-all duration-500"
                    d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" 
                />
            </svg>
        </div>
        {/* Moon icon */}
        <div 
            className={`
                absolute inset-0 transform transition-all duration-500 ease-in-out
                ${theme === 'dark' 
                    ? 'rotate-0 scale-100 -translate-y-0 opacity-100' 
                    : '-rotate-[360deg] scale-0 -translate-y-10 opacity-0'
                }
            `}
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor"
                className="transform-gpu"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="transform origin-center transition-all duration-500" 
                    d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" 
                />
            </svg>
        </div>
    </div>
);

// Company size options
const COMPANY_SIZES = [
  'Solo',
  'Small (2-10 employees)',
  'Medium (11-50 employees)',
  'Large (51-200 employees)',
  'Enterprise (201+ employees)'
];

// Industry options
const INDUSTRIES = [
  'E-commerce',
  'Retail',
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Food & Beverage',
  'Manufacturing',
  'Real Estate',
  'Travel',
  'Entertainment',
  'Marketing',
  'Consulting',
  'Non-profit',
  'Other'
];

// Marketing goals options
const GOALS = [
  'Increase brand awareness',
  'Generate leads/customers',
  'Promote new products/services',
  'Engage with existing customers',
  'Drive website traffic',
  'Boost sales conversion',
  'Increase social media presence',
  'Improve customer retention',
  'Enter new markets',
  'Enhance brand image'
];

// Ad frequency options
const AD_FREQUENCIES = [
  'Daily',
  'Weekly',
  'Bi-weekly',
  'Monthly',
  'Quarterly',
  'Occasionally as needed'
];

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');
    const [theme, setTheme] = useState('light');
    const [isSaving, setIsSaving] = useState(false);
    const [userData, setUserData] = useState<Partial<UserProfile>>({});
    const [formData, setFormData] = useState<Partial<UserProfile>>({});
    const [savingSection, setSavingSection] = useState<string | null>(null);

    // Load user data from Firebase
    useEffect(() => {
        const loadUserData = async () => {
            if (!user?.uid) return;
            
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data() as Partial<UserProfile>;
                    console.log('User data loaded from Firebase:', data);
                    console.log('Business data loaded:', data.business);
                    
                    // Ensure proper structure for nested objects
                    if (!data.business) {
                        data.business = {
                            products: [],
                            targetAudience: '',
                            goals: [],
                            adFrequency: ''
                        };
                    }
                    
                    if (!data.company) {
                        data.company = {
                            name: '',
                            website: '',
                            industry: '',
                            size: '',
                            founded: '',
                            location: ''
                        };
                    }
                    
                    setUserData(data);
                    setFormData(data);
                    setTheme(data.theme || 'light');
                    document.documentElement.setAttribute('data-theme', data.theme || 'light');
                    
                    // Check URL parameters for tab selection
                    const urlParams = new URLSearchParams(window.location.search);
                    const tabParam = urlParams.get('tab');
                    if (tabParam && ['profile', 'company', 'business', 'billing'].includes(tabParam)) {
                        setActiveTab(tabParam);
                    } else if (urlParams.get('from') === 'onboarding') {
                        // Default to business tab if coming from onboarding
                        setActiveTab('business');
                    }
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                toast.error('Failed to load your profile data');
            }
        };

        loadUserData();
    }, [user?.uid]);

    // Theme toggle handler with Firebase sync
    const toggleTheme = async () => {
        if (!user?.uid || isSaving) return;

        const newTheme = theme === 'light' ? 'dark' : 'light';
        setIsSaving(true);

        try {
            // Use the helper function to save theme
            await saveUserData(user.uid, { theme: newTheme });
            
            setTheme(newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            toast.success('Theme preference saved');
        } catch (error) {
            console.error('Error saving theme:', error);
            // Revert theme if save fails
            document.documentElement.setAttribute('data-theme', theme);
            toast.error('Failed to save theme preference');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle form input changes
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, 
        section?: string, 
        field?: string
    ) => {
        const { name, value } = e.target;
        
        if (section && field) {
            // Handle nested fields (company, business, etc.)
            setFormData(prev => {
                const result = { ...prev };
                
                // Handle each section type specifically with proper typing
                if (section === 'company' && result.company) {
                    result.company = { 
                        ...result.company, 
                        [field]: value 
                    };
                } else if (section === 'business' && result.business) {
                    result.business = { 
                        ...result.business, 
                        [field]: value 
                    };
                } else if (section === 'preferences' && result.preferences) {
                    result.preferences = { 
                        ...result.preferences, 
                        [field]: value 
                    };
                } else {
                    // Initialize the section if it doesn't exist
                    // Type assertion is necessary for dynamic section assignment
                    // @ts-expect-error - Suppressing error for dynamic property assignment
                    result[section] = { 
                        [field]: value 
                    };
                }
                
                return result;
            });
        } else {
            // Handle top-level fields
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    
    // Handle checkbox changes for goals
    const handleGoalToggle = (goal: string) => {
        const currentGoals = formData.business?.goals || [];
        let newGoals;
        
        if (currentGoals.includes(goal)) {
            newGoals = currentGoals.filter(g => g !== goal);
        } else {
            newGoals = [...currentGoals, goal];
        }
        
        setFormData(prev => ({
            ...prev,
            business: {
                ...prev.business,
                goals: newGoals
            }
        }));
    };
    
    // Handle form submission for each section
    const saveSection = async (section: string) => {
        if (!user?.uid) return;
        
        setSavingSection(section);
        
        try {
            // Create a flat doc update that explicitly sets each field
            const docData: Record<string, unknown> = {};
            
            // Determine which data to update based on section
            if (section === 'personal') {
                docData.displayName = formData.displayName;
                docData.phoneNumber = formData.phoneNumber;
                docData.bio = formData.bio;
            } else if (section === 'company') {
                docData.company = formData.company;
            } else if (section === 'business') {
                // Handle business data specially - explicitly set each field
                const businessData = formData.business;
                if (businessData) {
                    docData.business = {
                        products: businessData.products || [],
                        targetAudience: businessData.targetAudience || '',
                        goals: businessData.goals || [],
                        adFrequency: businessData.adFrequency || ''
                    };
                }
            }
            
            // Use setDoc with merge for more reliable updates
            await setDoc(doc(db, 'users', user.uid), docData, { merge: true });
            
            // Update local userData state to reflect changes
            setUserData(prev => ({
                ...prev,
                ...docData
            }));
            
            toast.success('Changes saved successfully');
        } catch (error) {
            console.error(`Error saving ${section} information:`, error);
            toast.error(`Failed to save ${section} information`);
        } finally {
            setSavingSection(null);
        }
    };

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="text-base-content/70">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="container mx-auto px-4 pt-8 pb-16 transition-colors duration-200">
            <div className="flex flex-col gap-8">
                {/* Profile Header */}
                <div className="bg-base-100 rounded-xl shadow-lg p-8 transition-all duration-200 hover:shadow-xl">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            {user.photoURL ? (
                                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 transition-all duration-200 group-hover:border-primary/40">
                                    <Image
                                        src={user.photoURL}
                                        alt={userData.displayName || user.displayName || 'Profile'}
                                        width={144}
                                        height={144}
                                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                </div>
                            ) : (
                                <div className="w-36 h-36 rounded-full bg-primary/10 flex items-center justify-center text-5xl font-bold text-primary border-4 border-primary/20 transition-all duration-200 group-hover:border-primary/40">
                                    {userData.displayName ? userData.displayName.charAt(0).toUpperCase() : 
                                     user.displayName ? user.displayName.charAt(0).toUpperCase() : 
                                     user.email?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <button className="btn btn-circle btn-sm btn-primary absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <FiEdit2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-3">
                            <h1 className="text-3xl font-bold text-base-content">
                                {userData.displayName || user.displayName || 'User'}
                            </h1>
                            <p className="text-base-content/70 text-lg">{user.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                                <span className="badge badge-primary badge-lg">Free Plan</span>
                                <span className="badge badge-ghost badge-lg">
                                    Joined {userData.joinDate ? new Date(userData.joinDate.toDate()).getFullYear() : new Date().getFullYear()}
                                </span>
                                {userData.company?.industry && (
                                    <span className="badge badge-secondary badge-lg">{userData.company.industry}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button 
                                className="btn btn-ghost rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform outline-1 outline-base-300"
                                onClick={toggleTheme}
                                disabled={isSaving}
                            >
                                <ThemeIcon theme={theme} />
                                <span className="ml-2 opacity-90">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                            </button>
                            <button className="btn btn-error btn-outline rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform" onClick={logout}>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs and Content */}
                <div className="flex flex-col gap-6">
                    <div className="tabs tabs-boxed bg-base-200/50 p-2 w-fit rounded-full">
                        <button
                            className={`tab tab-lg transition-all duration-200 ${activeTab === 'profile' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Profile Information
                        </button>
                        <button
                            className={`tab tab-lg transition-all duration-200 ${activeTab === 'company' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('company')}
                        >
                            Company
                        </button>
                        <button
                            className={`tab tab-lg transition-all duration-200 ${activeTab === 'business' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('business')}
                        >
                            Business
                        </button>
                        <button
                            className={`tab tab-lg transition-all duration-200 ${activeTab === 'billing' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('billing')}
                        >
                            Billing
                        </button>
                    </div>

                    {/* Profile Tab Content */}
                    {activeTab === 'profile' && (
                        <div className="bg-base-100 rounded-xl shadow-lg p-8 transition-all duration-200 hover:shadow-xl">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold">Personal Information</h2>
                                <button 
                                    className="btn btn-sm btn-ghost btn-circle"
                                    onClick={() => saveSection('personal')}
                                    disabled={savingSection === 'personal'}
                                >
                                    {savingSection === 'personal' ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <FiSave className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base">Name</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        name="displayName"
                                        className="input input-bordered w-full transition-all duration-200 focus:input-primary"
                                        value={formData.displayName || ''}
                                        onChange={handleChange}
                                        placeholder="Your name"
                                    />
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base">Email</span>
                                    </label>
                                    <input 
                                        type="email" 
                                        className="input input-bordered w-full opacity-70"
                                        value={user.email || ''}
                                        readOnly
                                        disabled
                                    />
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base">Phone Number</span>
                                    </label>
                                    <input 
                                        type="tel" 
                                        name="phoneNumber"
                                        className="input input-bordered w-full transition-all duration-200 focus:input-primary"
                                        value={formData.phoneNumber || ''}
                                        onChange={handleChange}
                                        placeholder="Your phone number"
                                    />
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base">Account Created</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        className="input input-bordered w-full opacity-70"
                                        value={userData.joinDate ? new Date(userData.joinDate.toDate()).toLocaleDateString() : ''}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="divider my-8"></div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base">Bio</span>
                                </label>
                                <textarea 
                                    name="bio"
                                    className="textarea textarea-bordered w-full h-32 transition-all duration-200 focus:textarea-primary"
                                    value={formData.bio || ''}
                                    onChange={handleChange}
                                    placeholder="Tell us about yourself or your business"
                                ></textarea>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button 
                                    className="btn btn-primary rounded-full px-8"
                                    onClick={() => saveSection('personal')}
                                    disabled={savingSection === 'personal'}
                                >
                                    {savingSection === 'personal' ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Company Tab Content */}
                    {activeTab === 'company' && (
                        <div className="bg-base-100 rounded-xl shadow-lg p-8 transition-all duration-200 hover:shadow-xl">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold">Company Information</h2>
                                <button 
                                    className="btn btn-sm btn-ghost btn-circle"
                                    onClick={() => saveSection('company')}
                                    disabled={savingSection === 'company'}
                                >
                                    {savingSection === 'company' ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <FiSave className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base flex items-center gap-2">
                                            <HiOutlineOfficeBuilding className="text-base-content/70" />
                                            Company Name
                                        </span>
                                    </label>
                                    <input 
                                        type="text" 
                                        className="input input-bordered w-full transition-all duration-200 focus:input-primary"
                                        value={formData.company?.name || ''}
                                        onChange={(e) => handleChange(e, 'company', 'name')}
                                        placeholder="Your company name"
                                    />
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base flex items-center gap-2">
                                            <HiOutlineGlobe className="text-base-content/70" />
                                            Website
                                        </span>
                                    </label>
                                    <input 
                                        type="url" 
                                        className="input input-bordered w-full transition-all duration-200 focus:input-primary"
                                        value={formData.company?.website || ''}
                                        onChange={(e) => handleChange(e, 'company', 'website')}
                                        placeholder="https://your-company.com"
                                    />
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base flex items-center gap-2">
                                            <HiOutlineTag className="text-base-content/70" />
                                            Industry
                                        </span>
                                    </label>
                                    <select 
                                        className="select select-bordered w-full transition-all duration-200 focus:select-primary"
                                        value={formData.company?.industry || ''}
                                        onChange={(e) => handleChange(e, 'company', 'industry')}
                                    >
                                        <option value="" disabled>Select an industry</option>
                                        {INDUSTRIES.map(industry => (
                                            <option key={industry} value={industry}>{industry}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base flex items-center gap-2">
                                            <HiOutlineUserGroup className="text-base-content/70" />
                                            Company Size
                                        </span>
                                    </label>
                                    <select 
                                        className="select select-bordered w-full transition-all duration-200 focus:select-primary"
                                        value={formData.company?.size || ''}
                                        onChange={(e) => handleChange(e, 'company', 'size')}
                                    >
                                        <option value="" disabled>Select company size</option>
                                        {COMPANY_SIZES.map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base flex items-center gap-2">
                                            <HiOutlineCalendar className="text-base-content/70" />
                                            Year Founded
                                        </span>
                                    </label>
                                    <input 
                                        type="text" 
                                        className="input input-bordered w-full transition-all duration-200 focus:input-primary"
                                        value={formData.company?.founded || ''}
                                        onChange={(e) => handleChange(e, 'company', 'founded')}
                                        placeholder="e.g. 2020"
                                    />
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base flex items-center gap-2">
                                            <HiOutlineLocationMarker className="text-base-content/70" />
                                            Location
                                        </span>
                                    </label>
                                    <input 
                                        type="text" 
                                        className="input input-bordered w-full transition-all duration-200 focus:input-primary"
                                        value={formData.company?.location || ''}
                                        onChange={(e) => handleChange(e, 'company', 'location')}
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button 
                                    className="btn btn-primary rounded-full px-8"
                                    onClick={() => saveSection('company')}
                                    disabled={savingSection === 'company'}
                                >
                                    {savingSection === 'company' ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Business Tab Content */}
                    {activeTab === 'business' && (
                        <div className="bg-base-100 rounded-xl shadow-lg p-8 transition-all duration-200 hover:shadow-xl">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold">Business Information</h2>
                                <button 
                                    className="btn btn-sm btn-ghost btn-circle"
                                    onClick={() => saveSection('business')}
                                    disabled={savingSection === 'business'}
                                >
                                    {savingSection === 'business' ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <FiSave className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base flex items-center gap-2">
                                            <MdOutlineBusinessCenter className="text-base-content/70" />
                                            Products or Services
                                        </span>
                                    </label>
                                    <textarea 
                                        className="textarea textarea-bordered w-full transition-all duration-200 focus:textarea-primary"
                                        value={formData.business?.products?.join(', ') || ''}
                                        onChange={(e) => {
                                            const productsArray = e.target.value
                                                .split(',')
                                                .map(p => p.trim())
                                                .filter(p => p);
                                                
                                            setFormData(prev => ({
                                                ...prev,
                                                business: {
                                                    ...prev.business,
                                                    products: productsArray
                                                }
                                            }));
                                        }}
                                        placeholder="What products or services do you offer? (separate with commas)"
                                    ></textarea>
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base flex items-center gap-2">
                                            <TbTarget className="text-base-content/70" />
                                            Target Audience
                                        </span>
                                    </label>
                                    <textarea 
                                        className="textarea textarea-bordered w-full transition-all duration-200 focus:textarea-primary"
                                        value={formData.business?.targetAudience || ''}
                                        onChange={(e) => handleChange(e, 'business', 'targetAudience')}
                                        placeholder="Describe your ideal customer or target audience"
                                    ></textarea>
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base flex items-center gap-2">
                                            <BsGraphUp className="text-base-content/70" />
                                            Marketing Goals
                                        </span>
                                        <span className="label-text-alt">Select all that apply</span>
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 bg-base-200/30 rounded-lg">
                                        {GOALS.map(goal => (
                                            <div key={goal} className="form-control">
                                                <label className="cursor-pointer label justify-start gap-2 hover:bg-base-200/70 rounded-lg px-2">
                                                    <input 
                                                        type="checkbox" 
                                                        className="checkbox checkbox-primary checkbox-sm" 
                                                        checked={formData.business?.goals?.includes(goal) || false}
                                                        onChange={() => handleGoalToggle(goal)}
                                                    />
                                                    <span className="label-text">{goal}</span> 
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base flex items-center gap-2">
                                            <IoIosTime className="text-base-content/70" />
                                            Ad Creation Frequency
                                        </span>
                                    </label>
                                    <select 
                                        className="select select-bordered w-full transition-all duration-200 focus:select-primary"
                                        value={formData.business?.adFrequency || ''}
                                        onChange={(e) => handleChange(e, 'business', 'adFrequency')}
                                    >
                                        <option value="" disabled>How often do you create ads?</option>
                                        {AD_FREQUENCIES.map(freq => (
                                            <option key={freq} value={freq}>{freq}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button 
                                    className="btn btn-primary rounded-full px-8"
                                    onClick={() => saveSection('business')}
                                    disabled={savingSection === 'business'}
                                >
                                    {savingSection === 'business' ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Billing Tab Content */}
                    {activeTab === 'billing' && (
                        <div className="bg-base-100 rounded-xl shadow-lg p-8 transition-all duration-200 hover:shadow-xl">
                            <h2 className="text-2xl font-bold mb-8">Billing Information</h2>

                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-lg font-bold">Current Plan</p>
                                        <p className="text-base-content/70">Free Plan</p>
                                    </div>
                                    <button className="btn btn-primary btn-lg">Upgrade Plan</button>
                                </div>

                                <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-200/50">
                                    <div className="stat">
                                        <div className="stat-title">Ad Generations</div>
                                        <div className="stat-value text-primary">8/10</div>
                                        <div className="stat-desc">This month</div>
                                    </div>

                                    <div className="stat">
                                        <div className="stat-title">Brainstorm Sessions</div>
                                        <div className="stat-value text-primary">5/5</div>
                                        <div className="stat-desc">This month</div>
                                    </div>

                                    <div className="stat">
                                        <div className="stat-title">Plan Renewal</div>
                                        <div className="stat-value text-success">FREE</div>
                                        <div className="stat-desc">Forever</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-bold mb-4">Available Plans</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="card bg-base-200">
                                        <div className="card-body">
                                            <h2 className="card-title">Free</h2>
                                            <p className="text-3xl font-bold">$0<span className="text-base font-normal text-base-content/70">/mo</span></p>
                                            <ul className="my-4 space-y-2">
                                                <li className="flex items-center">
                                                    <FiCheck className="w-4 h-4 mr-2 text-success" />
                                                    10 Ad Generations
                                                </li>
                                                <li className="flex items-center">
                                                    <FiCheck className="w-4 h-4 mr-2 text-success" />
                                                    5 Brainstorm Sessions
                                                </li>
                                                <li className="flex items-center text-base-content/50">
                                                    <FiX className="w-4 h-4 mr-2" />
                                                    Standard Templates Only
                                                </li>
                                            </ul>
                                            <div className="card-actions justify-end">
                                                <button className="btn btn-outline rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform btn-block" disabled>Current Plan</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card bg-base-200 border-2 border-primary">
                                        <div className="card-body">
                                            <div className="badge badge-primary mb-2">Popular</div>
                                            <h2 className="card-title">Pro</h2>
                                            <p className="text-3xl font-bold">$29<span className="text-base font-normal text-base-content/70">/mo</span></p>
                                            <ul className="my-4 space-y-2">
                                                <li className="flex items-center">
                                                    <FiCheck className="w-4 h-4 mr-2 text-success" />
                                                    100 Ad Generations
                                                </li>
                                                <li className="flex items-center">
                                                    <FiCheck className="w-4 h-4 mr-2 text-success" />
                                                    Unlimited Brainstorm
                                                </li>
                                                <li className="flex items-center">
                                                    <FiCheck className="w-4 h-4 mr-2 text-success" />
                                                    Premium Templates
                                                </li>
                                            </ul>
                                            <div className="card-actions justify-end">
                                                <button className="btn btn-primary rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform btn-block">Upgrade</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card bg-base-200">
                                        <div className="card-body">
                                            <h2 className="card-title">Business</h2>
                                            <p className="text-3xl font-bold">$99<span className="text-base font-normal text-base-content/70">/mo</span></p>
                                            <ul className="my-4 space-y-2">
                                                <li className="flex items-center">
                                                    <FiCheck className="w-4 h-4 mr-2 text-success" />
                                                    Unlimited Ad Generations
                                                </li>
                                                <li className="flex items-center">
                                                    <FiCheck className="w-4 h-4 mr-2 text-success" />
                                                    Unlimited Brainstorm
                                                </li>
                                                <li className="flex items-center">
                                                    <FiCheck className="w-4 h-4 mr-2 text-success" />
                                                    White Label Exports
                                                </li>
                                            </ul>
                                            <div className="card-actions justify-end">
                                                <button className="btn btn-outline rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform btn-block">Upgrade</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}