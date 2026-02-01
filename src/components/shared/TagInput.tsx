import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TagOption {
  id: string;
  name: string;
}

export interface TagInputProps {
  /** Available options to select from */
  options: TagOption[];
  /** Currently selected tag IDs */
  value: string[];
  /** Callback when selection changes */
  onChange: (selectedIds: string[]) => void;
  /** Placeholder text when no tags are selected */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Maximum number of tags that can be selected (optional) */
  maxTags?: number;
  /** Allow creating new tags not in options */
  allowCreate?: boolean;
  /** Callback when a new tag is created */
  onCreateTag?: (name: string) => void;
}

/**
 * TagInput - A multi-select tag input component with search/filter functionality.
 * 
 * Follows JKE Solutions brand guidelines with customizable options.
 */
export function TagInput({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  className,
  maxTags,
  allowCreate = false,
  onCreateTag,
}: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected tag objects
  const selectedTags = options.filter(opt => value.includes(opt.id));

  // Filter options based on search term
  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !value.includes(opt.id)
  );

  // Check if we can add more tags
  const canAddMore = !maxTags || value.length < maxTags;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (optionId: string) => {
    if (value.includes(optionId)) {
      onChange(value.filter(id => id !== optionId));
    } else if (canAddMore) {
      onChange([...value, optionId]);
    }
  };

  const handleRemoveTag = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(id => id !== optionId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchTerm === '' && value.length > 0) {
      // Remove last tag on backspace when input is empty
      onChange(value.slice(0, -1));
    } else if (e.key === 'Enter' && searchTerm.trim() !== '') {
      e.preventDefault();
      // If there's a matching option, select it
      const matchingOption = filteredOptions.find(
        opt => opt.name.toLowerCase() === searchTerm.toLowerCase()
      );
      if (matchingOption) {
        handleToggleOption(matchingOption.id);
        setSearchTerm('');
      } else if (allowCreate && onCreateTag) {
        // Create new tag
        onCreateTag(searchTerm.trim());
        setSearchTerm('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleContainerClick = () => {
    if (!disabled) {
      setIsOpen(true);
      inputRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Input Container */}
      <div
        onClick={handleContainerClick}
        className={cn(
          'min-h-[44px] px-3 py-1.5 rounded-xl border bg-slate-50 flex flex-wrap gap-2 items-center cursor-text transition-all',
          'border-slate-200',
          isOpen && 'ring-2 ring-primary border-transparent',
          disabled && 'opacity-50 cursor-not-allowed bg-slate-100'
        )}
      >
        {/* Selected Tags */}
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100 text-sky-700 text-xs font-semibold rounded-lg"
          >
            {tag.name}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => handleRemoveTag(tag.id, e)}
                className="hover:text-sky-900 focus:outline-none transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        {/* Search Input */}
        {canAddMore && !disabled && (
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedTags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm text-slate-600 placeholder:text-slate-400"
            disabled={disabled}
          />
        )}

        {/* Dropdown Arrow */}
        <ChevronDown 
          className={cn(
            'h-4 w-4 text-slate-400 ml-auto transition-transform',
            isOpen && 'rotate-180'
          )} 
        />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map(option => (
                <li
                  key={option.id}
                  onClick={() => {
                    handleToggleOption(option.id);
                    setSearchTerm('');
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    'px-3 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2',
                    'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <span className="flex-1">{option.name}</span>
                  {value.includes(option.id) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-4 text-sm text-slate-500 text-center">
              {searchTerm ? (
                allowCreate ? (
                  <button
                    onClick={() => {
                      if (onCreateTag) {
                        onCreateTag(searchTerm.trim());
                        setSearchTerm('');
                      }
                    }}
                    className="text-primary hover:underline"
                  >
                    + Crear "{searchTerm}"
                  </button>
                ) : (
                  'No se encontraron resultados'
                )
              ) : (
                'No hay opciones disponibles'
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
