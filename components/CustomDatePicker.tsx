'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormField, FormLabel, FormMessage } from "./ui/form";
import { DayPicker } from 'react-day-picker';
import { Calendar } from 'lucide-react';
import 'react-day-picker/dist/style.css';

const CustomDatePicker = <T extends FieldValues>({
    control,
    name,
    label,
    placeholder,
    minDate,
    maxDate,
}: CustomDatePickerProps<T>) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <div className="form-item relative" ref={wrapperRef}>
                    <FormLabel className="form-label">{label}</FormLabel>
                    <div className="flex w-full flex-col">
                        <FormControl>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={placeholder}
                                    className="input-class border rounded px-2.5 py-1.5 "
                                    value={field.value || ''}
                                    readOnly
                                    onClick={() => setShowCalendar(!showCalendar)}
                                />
                                <Calendar
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-5 text-gray-400 cursor-pointer"
                                    onClick={() => setShowCalendar(!showCalendar)}
                                />
                            </div>
                        </FormControl>

                        {showCalendar && (
                            <div className="absolute z-50 mt-2 bg-white shadow-lg rounded-lg p-3">
                                <DayPicker
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => {
                                        field.onChange(date ? date.toISOString().split('T')[0] : '');
                                        setShowCalendar(false);
                                    }}
                                    fromDate={minDate}
                                    toDate={maxDate}
                                    modifiers={{
                                        weekend: (date) => date.getDay() === 0 || date.getDay() === 6,
                                    }}
                                    modifiersClassNames={{
                                        weekend: 'bg-blue-50 text-blue-700 rounded',
                                    }}
                                    className="rounded-lg"
                                    captionLayout="dropdown"
                                />
                            </div>
                        )}

                        <FormMessage className="form-message mt-2">
                            {fieldState.error?.message}
                        </FormMessage>
                    </div>
                </div>
            )}
        />
    )
}

export default CustomDatePicker;
