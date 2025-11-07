import React, { useState } from 'react';
import AddTaskModal from './common/AddTaskModal';
import FrequencySelect from './common/FrequencySelect';
import PlusIcon from '../../assets/plus2.svg';
import DeleteIcon from '../../assets/trash-red.svg';

const CommercialCleaningJobDetailsForm = ({ 
  formData, 
  onInputChange
}) => {
  const [customTasks, setCustomTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [frequency, setFrequency] = useState('One-time');
  const [preferredDays, setPreferredDays] = useState({});
  const [customDates, setCustomDates] = useState([]);

  // Predefined cleaning tasks
  const predefinedTasks = [
    'General Cleaning (Dusting, Vacuuming, Mopping)',
    'Bathroom Sanitization',
    'Kitchen/Breakroom Cleaning',
    'Window Cleaning (Interior)',
    'Trash Removal & Recycling'
  ];

  const [selectedTasks, setSelectedTasks] = useState({});

  const handleTaskToggle = (task) => {
    setSelectedTasks(prev => ({
      ...prev,
      [task]: !prev[task]
    }));
  };

  const handleAddCustomTask = () => {
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setTaskInput('');
  };

  const handleTaskInputChange = (e) => {
    const value = e.target.value;
    setTaskInput(value);
    
    if (value.includes(',')) {
      const tasks = value.split(',').map(task => task.trim()).filter(task => task);
      if (tasks.length > 0) {
        setCustomTasks([...customTasks, ...tasks]);
        const lastPart = value.split(',').pop().trim();
        setTaskInput(lastPart);
      }
    }
  };

  const handleSaveTasks = () => {
    if (taskInput.trim()) {
      setCustomTasks([...customTasks, taskInput.trim()]);
      setTaskInput('');
      setShowTaskModal(false);
    } else {
      setShowTaskModal(false);
    }
  };

  const handleRemoveTask = (index) => {
    setCustomTasks(customTasks.filter((_, i) => i !== index));
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

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Property Type Section */}
      <div>
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-primary-500 mb-2">
          Commercial Cleaning
        </h2>
        <p className="text-xs sm:text-sm text-primary-500 font-medium mb-4">
          What type of property needs cleaning?
        </p>
        <input
          type="text"
          value={formData.propertyType || ''}
          onChange={(e) => onInputChange('propertyType', e.target.value)}
          placeholder="Property Type"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E5E7EB] rounded-lg focus:outline-none text-xs sm:text-sm lg:text-base bg-white text-primary-500 placeholder:text-primary-200"
        />
      </div>

      {/* Property Size Section */}
      <div>
        <h2 className="text-base sm:text-lg font-medium text-primary-500 mb-2">
          Property Size
        </h2>
        <div className="relative">
          <input
            type="text"
            value={formData.propertySize || ''}
            onChange={(e) => onInputChange('propertySize', e.target.value)}
            placeholder="Enter property size"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E5E7EB] rounded-lg focus:outline-none text-xs sm:text-sm lg:text-base bg-white text-primary-500 placeholder:text-primary-200"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <span className="text-xs sm:text-sm text-primary-200 font-medium">Sq.ft</span>
          </div>
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

      {/* Cleaning Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-base sm:text-lg font-medium text-primary-500">Cleaning Tasks</h3>
          <button
            type="button"
            onClick={handleAddCustomTask}
            className="flex items-center gap-1 sm:gap-2 text-[#1F6FEB] font-medium cursor-pointer text-xs sm:text-sm"
          >
            <img src={PlusIcon} alt="Add" className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add Custom Task</span>
            <span className="sm:hidden">Add Task</span>
          </button>
        </div>

        {/* Predefined Tasks Checkboxes */}
        <div className="space-y-3">
          {predefinedTasks.map((task, index) => (
            <div key={index} className="flex items-center">
              <input
                type="checkbox"
                id={`task-${index}`}
                checked={selectedTasks[task] || false}
                onChange={() => handleTaskToggle(task)}
                className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 border-gray-300 rounded  cursor-pointer"
              />
              <label
                htmlFor={`task-${index}`}
                className="ml-3 text-xs sm:text-sm lg:text-base text-primary-500 font-medium cursor-pointer"
              >
                {task}
              </label>
            </div>
          ))}
        </div>

        {/* Display Added Custom Tasks */}
        {customTasks.length > 0 && (
          <div className="mt-4 space-y-2">
            {customTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-xs sm:text-sm text-primary-500 font-medium pr-2 break-words flex-1">{task}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTask(index)}
                  className="text-red-500 hover:text-red-600 cursor-pointer flex-shrink-0"
                >
                  <img src={DeleteIcon} alt="Delete" className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions Section */}
      <div>
        <h3 className="text-base sm:text-lg font-medium text-primary-500 mb-3 sm:mb-4">
          Anything specific we should know? <span className="text-primary-200 font-medium text-xs sm:text-base"> (Optional)</span>
        </h3>
        <div className="relative">
          <textarea
            value={formData.instructions || ''}
            onChange={(e) => onInputChange('instructions', e.target.value)}
            placeholder="Write your instructions here in any...."
            rows={4}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#E5E7EB] rounded-xl! focus:outline-none text-xs sm:text-sm lg:text-base resize-none"
          />
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showTaskModal}
        onClose={handleCloseTaskModal}
        onSave={handleSaveTasks}
        value={taskInput}
        onChange={handleTaskInputChange}
        title="Add Custom Task"
        description="List tasks by using a comma (,) between each one. e.g. Task 1, Task 2, Task 3"
        placeholder="Enter Task"
        saveButtonText="Add"
      />
    </div>
  );
};

export default CommercialCleaningJobDetailsForm;

