import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UploadFileModal } from './UploadFileModal';
import { useFileUpload } from './hooks/useFileUpload';
import { useFileLibrary } from './hooks/useFileLibrary';
import { useImageEditor } from './hooks/useImageEditor';

// Mock the hooks
vi.mock('./hooks/useFileUpload', () => ({
    useFileUpload: vi.fn(),
}));
vi.mock('./hooks/useFileLibrary', () => ({
    useFileLibrary: vi.fn(),
}));
vi.mock('./hooks/useImageEditor', () => ({
    useImageEditor: vi.fn(),
}));

// Mock the UI components that use Portals or complex logic
vi.mock('@/components/ui/Modal', () => ({
    Modal: ({ children, isOpen, onClose, title }: any) => isOpen ? (
        <div data-testid="mock-modal">
            <h1>{title}</h1>
            <button aria-label="Cerrar" onClick={onClose}>X</button>
            {children}
        </div>
    ) : null,
}));

vi.mock('@/components/ui/tabs', () => ({
    Tabs: ({ children, value }: any) => (
        <div data-testid="mock-tabs" data-current={value}>
            {/* Pass onValueChange to triggers via some prop or just mock it */}
            {children}
        </div>
    ),
    TabsList: ({ children }: any) => <div>{children}</div>,
    TabsTrigger: ({ children, value }: any) => (
        <button data-testid={`trigger-${value}`} onClick={() => {}}>
            {children}
        </button>
    ),
    TabsContent: ({ children, value }: any) => (
        <div data-testid={`content-${value}`}>
            {children}
        </div>
    ),
}));

describe('UploadFileModal integration', () => {
    const mockOnClose = vi.fn();
    const mockOnSuccess = vi.fn();
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSuccess: mockOnSuccess,
        showLibraryTab: true,
    };

    const mockFileUploadState = {
        isUploading: false,
        selectedFile: null,
        setSelectedFile: vi.fn(),
        previewUrl: null,
        isDragging: false,
        setIsDragging: vi.fn(),
        uploadedFiles: [],
        setUploadedFiles: vi.fn(),
        externalLink: { name: '', url: '', mimeType: 'application/pdf' },
        setExternalLink: vi.fn(),
        fileInputRef: { current: null },
        handleFileSelect: vi.fn(),
        handleUpload: vi.fn(),
        handleRegisterExternal: vi.fn(),
        resetUpload: vi.fn(),
    };

    const mockFileLibraryState = {
        libraryFiles: [],
        librarySearch: '',
        setLibrarySearch: vi.fn(),
        libraryPage: 1,
        setLibraryPage: vi.fn(),
        libraryTotalPages: 1,
        isLoadingLibrary: false,
        selectedLibraryFile: null,
        setSelectedLibraryFile: vi.fn(),
        resetLibrary: vi.fn(),
    };

    const mockImageEditorState = {
        rotation: 0,
        zoom: 1,
        isCropping: false,
        rotateLeft: vi.fn(),
        rotateRight: vi.fn(),
        toggleCropping: vi.fn(),
        resetEditor: vi.fn(),
        getCroppedImage: vi.fn(),
        setZoom: vi.fn(),
        setRotation: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useFileUpload as any).mockReturnValue(mockFileUploadState);
        (useFileLibrary as any).mockReturnValue(mockFileLibraryState);
        (useImageEditor as any).mockReturnValue(mockImageEditorState);
    });

    it('renders nothing when isOpen is false', () => {
        render(<UploadFileModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByTestId('mock-modal')).toBeNull();
    });

    it('renders with all tabs enabled', () => {
        render(<UploadFileModal {...defaultProps} />);
        expect(screen.getByTestId('trigger-upload')).toBeDefined();
        expect(screen.getByTestId('trigger-library')).toBeDefined();
        expect(screen.getByTestId('trigger-external')).toBeDefined();
    });

    it('resets all hooks on close', () => {
        render(<UploadFileModal {...defaultProps} />);
        
        const closeBtn = screen.getByLabelText(/Cerrar/i);
        fireEvent.click(closeBtn);

        expect(mockFileUploadState.resetUpload).toHaveBeenCalled();
        expect(mockFileLibraryState.resetLibrary).toHaveBeenCalled();
        expect(mockImageEditorState.resetEditor).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('shows upload button when file is selected', () => {
        (useFileUpload as any).mockReturnValue({
            ...mockFileUploadState,
            selectedFile: new File([''], 'test.png', { type: 'image/png' }),
            previewUrl: 'mock-url'
        });

        render(<UploadFileModal {...defaultProps} />);
        expect(screen.getByText(/Iniciar Carga/i)).toBeDefined();
    });

    it('executes handleUpload when Iniciar Carga is clicked', async () => {
        (useFileUpload as any).mockReturnValue({
            ...mockFileUploadState,
            selectedFile: new File([''], 'test.png', { type: 'image/png' }),
            previewUrl: 'mock-url'
        });

        render(<UploadFileModal {...defaultProps} />);
        
        const uploadBtn = screen.getByText(/Iniciar Carga/i);
        fireEvent.click(uploadBtn);

        expect(mockImageEditorState.getCroppedImage).toHaveBeenCalled();
    });
});
