import React from 'react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, isDeleting }: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-base-100 rounded-3xl p-8 max-w-md w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Delete Generation</h3>
                        <p className="text-base-content/70">Are you sure you want to delete this generation? This action cannot be undone.</p>
                    </div>
                    <div className="flex gap-3 mt-2">
                        <button
                            className="btn btn-ghost rounded-full px-6"
                            onClick={onClose}
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-error rounded-full px-6"
                            onClick={onConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 