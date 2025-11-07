import React, { useState, useRef } from 'react';
import { FloatingLabelInput } from '../form-controls';
import AddTaskModal from './common/AddTaskModal';
import FrequencySelect from './common/FrequencySelect';
import plusIcon from '../../assets/plus2.svg';
import trashIcon from '../../assets/trash-red.svg';
import arrowDownIcon from '../../assets/down2.svg';

const NDISSupportJobDetailsForm = ({ formData, onInputChange }) => {
    const [ndisNumber, setNdisNumber] = useState('657 645 546');
    const [supportType, setSupportType] = useState('Cleaning');
    const [tasks, setTasks] = useState([]);
    const [customTask, setCustomTask] = useState('');
    const [frequency, setFrequency] = useState('One-time');
    const [preferredDays, setPreferredDays] = useState({});
    const [customDates, setCustomDates] = useState([]);
    const [instructions, setInstructions] = useState('');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [isSupportTypeOpen, setIsSupportTypeOpen] = useState(false);

    const supportTypeRef = useRef(null);

    // Support Type Options
    const supportTypeOptions = [
        'Cleaning',
        'Daily Assistance',
    ];

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (supportTypeRef.current && !supportTypeRef.current.contains(event.target)) {
                setIsSupportTypeOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle NDIS Number input with formatting
    const handleNdisNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 9) {
            // Format as XXX XXX XXX
            const formatted = value.replace(/(\d{3})(?=\d)/g, '$1 ');
            setNdisNumber(formatted);
            onInputChange('ndisNumber', value);
        }
    };

    // Handle adding custom task
    const handleOpenTaskModal = () => {
        setShowTaskModal(true);
    };

    const handleCloseTaskModal = () => {
        setShowTaskModal(false);
        setCustomTask('');
    };

    const handleTaskInputChange = (e) => {
        const value = e.target.value;
        setCustomTask(value);

        // Auto-split on comma for multiple tasks
        if (value.includes(',')) {
            const taskList = value.split(',').map(task => task.trim()).filter(task => task);
            if (taskList.length > 0) {
                const newTasks = [...tasks, ...taskList];
                setTasks(newTasks);
                onInputChange('tasks', newTasks);
                const lastPart = value.split(',').pop().trim();
                setCustomTask(lastPart);
            }
        }
    };

    const handleSaveTasks = () => {
        if (customTask.trim()) {
            const taskList = customTask.split(',').map(task => task.trim()).filter(task => task);
            const newTasks = [...tasks, ...taskList];
            setTasks(newTasks);
            setCustomTask('');
            setShowTaskModal(false);
            onInputChange('tasks', newTasks);
        } else {
            setShowTaskModal(false);
        }
    };

    // Handle removing task
    const handleRemoveTask = (index) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
        onInputChange('tasks', updatedTasks);
    };

    // Handle support type selection
    const handleSupportTypeSelect = (type) => {
        setSupportType(type);
        setIsSupportTypeOpen(false);
        onInputChange('supportType', type);
    };

    // Handle frequency change
    const handleFrequencyChange = (option) => {
        setFrequency(option);
        onInputChange('frequency', option);
    };

    // Handle preferred days change
    const handlePreferredDaysChange = (days) => {
        setPreferredDays(days);
        onInputChange('preferredDays', days);
    };

    // Handle custom dates change
    const handleCustomDatesChange = (dates) => {
        setCustomDates(dates);
        onInputChange('customDates', dates);
    };

    // Handle instructions change
    const handleInstructionsChange = (e) => {
        setInstructions(e.target.value);
        onInputChange('instructions', e.target.value);
    };

    return (
        <div className="space-y-6">
            {/* NDIS Support Section */}
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">NDIS Support</h2>
                <p className="text-sm sm:text-base text-primary-200 font-medium mb-4">
                    Reliable help for your home, health, and daily needs—NDIS-ready.
                </p>

                {/* NDIS Number */}
                <FloatingLabelInput
                    id="ndisNumber"
                    name="ndisNumber"
                    label="NDIS Number"
                    type="text"
                    value={ndisNumber}
                    onChange={handleNdisNumberChange}
                    required
                />
            </div>


            {/* Support Type Section */}
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-primary-500 mb-3">Support Type</h3>
                <div className="relative" ref={supportTypeRef}>
                    <div
                        onClick={() => setIsSupportTypeOpen(!isSupportTypeOpen)}
                        className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-full bg-white cursor-pointer hover:border-primary-500 transition-colors"
                    >
                        <span className="text-gray-900">{supportType}</span>
                        <img src={arrowDownIcon} alt="Dropdown" className={`w-5 h-5 transition-transform ${isSupportTypeOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isSupportTypeOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {supportTypeOptions.map((option) => (
                                <div
                                    key={option}
                                    onClick={() => handleSupportTypeSelect(option)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                                >
                                    {option}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Tasks Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-primary-500">Tasks</h3>
                    <button
                        type="button"
                        onClick={handleOpenTaskModal}
                        className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium text-sm cursor-pointer"
                    >
                        <img src={plusIcon} alt="Add" className="w-4 h-4" />
                        <span className="text-[#1F6FEB]">Add Custom Task</span>
                    </button>
                </div>

                {/* Tasks List */}
                <div className="space-y-2">
                    {tasks.map((task, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-900 font-medium">{task}</span>
                            <button
                                type="button"
                                onClick={() => handleRemoveTask(index)}
                                className="cursor-pointer"
                            >
                                <img src={trashIcon} alt="Delete" className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Frequency Section */}
            <FrequencySelect
                frequency={frequency}
                preferredDays={preferredDays}
                customDates={customDates}
                onFrequencyChange={handleFrequencyChange}
                onPreferredDaysChange={handlePreferredDaysChange}
                onCustomDatesChange={handleCustomDatesChange}
            />

            {/* Anything Specific Section */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-primary-500">
                        Anything specific we should know?
                    </h3>
                    <span className="text-primary-200 font-medium text-sm">(Optional)</span>
                </div>
                <textarea
                    value={instructions}
                    onChange={handleInstructionsChange}
                    placeholder="Write your instructions here in any...."
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl! focus:outline-none text-primary-500 resize-none"
                    rows={4}
                />
            </div>

            {/* Add Task Modal */}
            <AddTaskModal
                isOpen={showTaskModal}
                onClose={handleCloseTaskModal}
                onSave={handleSaveTasks}
                value={customTask}
                onChange={handleTaskInputChange}
                title="Add Custom Task"
                description="List tasks by using a comma (,) between each one. e.g. Task 1, Task 2, Task 3"
                placeholder="Enter Task"
                saveButtonText="Add"
            />

        </div>
    );
};

export default NDISSupportJobDetailsForm;

