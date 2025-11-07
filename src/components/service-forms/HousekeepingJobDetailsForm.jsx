import React, { useState, useRef, useEffect } from 'react';
import AddTaskModal from './common/AddTaskModal';
import FrequencySelect from './common/FrequencySelect';
import plusIcon from '../../assets/plus2.svg';
import trashIcon from '../../assets/trash-red.svg';
import arrowDownIcon from '../../assets/down2.svg';

const HousekeepingJobDetailsForm = ({ formData, onInputChange }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [customServices, setCustomServices] = useState([]);
  const [frequency, setFrequency] = useState('One-time');
  const [preferredDays, setPreferredDays] = useState({});
  const [customDates, setCustomDates] = useState([]);
  const [defaultTasks, setDefaultTasks] = useState({
    'General Cleaning (Dusting, Vacuuming, Mopping)': false,
    'Bathroom Sanitization': false,
    'Kitchen/Breakroom Cleaning': false,
    'Window Cleaning (Interior)': false,
    'Trash Removal & Recycling': false
  });
  const [customTasks, setCustomTasks] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newServiceInput, setNewServiceInput] = useState('');
  const [isServiceTypeOpen, setIsServiceTypeOpen] = useState(false);
  
  const serviceTypeRef = useRef(null);

  // Housekeeping Service Type Options
  const housekeepingServiceOptions = [
    'Vacuuming',
    'Mopping',
    'Dusting',
    'Wiping Down',
    'Rubbish Disposal',
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (serviceTypeRef.current && !serviceTypeRef.current.contains(event.target)) {
        setIsServiceTypeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle housekeeping service type toggle (multi-select)
  const handleServiceTypeToggle = (option) => {
    let updatedServices;
    if (selectedServices.includes(option)) {
      updatedServices = selectedServices.filter(service => service !== option);
    } else {
      updatedServices = [...selectedServices, option];
    }
    setSelectedServices(updatedServices);
    onInputChange('housekeepingServiceType', updatedServices);
  };

  // Handle custom service addition
  const handleOpenServiceModal = () => {
    setIsServiceTypeOpen(false);
    setShowServiceModal(true);
  };

  const handleCloseServiceModal = () => {
    setShowServiceModal(false);
    setNewServiceInput('');
  };

  const handleNewServiceInputChange = (e) => {
    setNewServiceInput(e.target.value);
  };

  const handleSaveNewService = () => {
    if (newServiceInput.trim()) {
      const serviceList = newServiceInput.split(',').map(s => s.trim()).filter(s => s);
      const newServices = [...serviceList];
      
      // Add to custom services and selected services
      const updatedCustomServices = [...customServices, ...newServices.filter(s => !housekeepingServiceOptions.includes(s) && !customServices.includes(s))];
      setCustomServices(updatedCustomServices);
      
      const updatedSelectedServices = [...selectedServices, ...newServices];
      setSelectedServices(updatedSelectedServices);
      onInputChange('housekeepingServiceType', updatedSelectedServices);
      
      setNewServiceInput('');
      setShowServiceModal(false);
    } else {
      setShowServiceModal(false);
    }
  };

  // Handle remove selected service
  const handleRemoveService = (serviceToRemove) => {
    const updatedServices = selectedServices.filter(service => service !== serviceToRemove);
    setSelectedServices(updatedServices);
    onInputChange('housekeepingServiceType', updatedServices);
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

  // Handle default task checkbox toggle
  const handleDefaultTaskToggle = (taskKey) => {
    const updatedTasks = {
      ...defaultTasks,
      [taskKey]: !defaultTasks[taskKey]
    };
    setDefaultTasks(updatedTasks);
    
    // Update formData with selected tasks
    const selectedTasks = Object.entries(updatedTasks)
      .filter(([_, isSelected]) => isSelected)
      .map(([task, _]) => task);
    
    onInputChange('housekeepingTasks', [...selectedTasks, ...customTasks]);
  };

  // Handle add custom task modal
  const handleOpenTaskModal = () => {
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setTaskInput('');
  };

  const handleTaskInputChange = (e) => {
    const value = e.target.value;
    setTaskInput(value);
    
    // Auto-split on comma for multiple tasks
    if (value.includes(',')) {
      const taskList = value.split(',').map(task => task.trim()).filter(task => task);
      if (taskList.length > 0) {
        const newCustomTasks = [...customTasks, ...taskList];
        setCustomTasks(newCustomTasks);
        
        // Update formData with all tasks
        const selectedDefaultTasks = Object.entries(defaultTasks)
          .filter(([_, isSelected]) => isSelected)
          .map(([task, _]) => task);
        onInputChange('housekeepingTasks', [...selectedDefaultTasks, ...newCustomTasks]);
        
        const lastPart = value.split(',').pop().trim();
        setTaskInput(lastPart);
      }
    }
  };

  const handleSaveTasks = () => {
    if (taskInput.trim()) {
      const taskList = taskInput.split(',').map(task => task.trim()).filter(task => task);
      const newCustomTasks = [...customTasks, ...taskList];
      setCustomTasks(newCustomTasks);
      
      // Update formData with all tasks
      const selectedDefaultTasks = Object.entries(defaultTasks)
        .filter(([_, isSelected]) => isSelected)
        .map(([task, _]) => task);
      onInputChange('housekeepingTasks', [...selectedDefaultTasks, ...newCustomTasks]);
      
      setTaskInput('');
      setShowTaskModal(false);
    } else {
      setShowTaskModal(false);
    }
  };

  const handleRemoveCustomTask = (index) => {
    const updatedCustomTasks = customTasks.filter((_, i) => i !== index);
    setCustomTasks(updatedCustomTasks);
    
    // Update formData with all tasks
    const selectedDefaultTasks = Object.entries(defaultTasks)
      .filter(([_, isSelected]) => isSelected)
      .map(([task, _]) => task);
    onInputChange('housekeepingTasks', [...selectedDefaultTasks, ...updatedCustomTasks]);
  };

  // Handle instructions change
  const handleInstructionsChange = (e) => {
    setInstructions(e.target.value);
    onInputChange('instructions', e.target.value);
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Housekeeping Service Section */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Housekeeping
        </h2>
        <p className="text-sm sm:text-base text-primary-200 font-medium mb-4 sm:mb-6">
          Select the housekeeping service you need.
        </p>
        {/* Housekeeping Service Type Dropdown */}
        <div className="relative" ref={serviceTypeRef}>
          <div
            onClick={() => setIsServiceTypeOpen(!isServiceTypeOpen)}
            className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-full bg-white cursor-pointer hover:border-primary-500 transition-colors mb-4"
          >
            <span className={selectedServices.length > 0 ? 'text-primary-500' : 'text-gray-400'}>
              {selectedServices.length > 0 
                ? `${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''} selected`
                : 'Housekeeping service type'}
            </span>
            <img 
              src={arrowDownIcon} 
              alt="Dropdown" 
              className={`w-5 h-5 transition-transform ${isServiceTypeOpen ? 'rotate-180' : ''}`} 
            />
          </div>
          {isServiceTypeOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {/* Default Service Options with Checkboxes */}
              {housekeepingServiceOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-primary-200 text-sm sm:text-base font-medium"
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(option)}
                    onChange={() => handleServiceTypeToggle(option)}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 cursor-pointer mr-3"
                  />
                  <span>{option}</span>
                </label>
              ))}
              
              {/* Custom Services with Checkboxes */}
              {customServices.map((service) => (
                <label
                  key={service}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-primary-200 text-sm sm:text sch-base font-medium"
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service)}
                    onChange={() => handleServiceTypeToggle(service)}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 cursor-pointer mr-3"
                  />
                  <span>{service}</span>
                </label>
              ))}
              
              {/* Add New Service Option */}
              <div
                onClick={handleOpenServiceModal}
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-[#1F6FEB] font-medium text-sm sm:text-base border-t border-gray-200"
              >
                <img src={plusIcon} alt="Add" className="w-4 h-4 mr-2" />
                <span >Add New Service</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Selected Services Display */}
        {selectedServices.length > 0 && (
          <div className="🎗️ flex flex-wrap gap-2">
            {selectedServices.map((service, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5  bg-blue-50 border border-blue-200 rounded-lg text-[#1F6FEB]"
              >
                <span className="text-sm text-primary-700 font-medium experimentation">{service}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveService(service)}
                  className="text-primary-600 hover:text-primary-800 cursor-pointer"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Frequency Section */}
      <div>
        <FrequencySelect
          frequency={frequency}
          preferredDays={preferredDays}
          customDates={customDates}
          onFrequencyChange={handleFrequencyChange}
          onPreferredDaysChange={handlePreferredDaysChange}
          onCustomDatesChange={handleCustomDatesChange}
        />
      </div>

      {/* Cleaning Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-primary-500">
            Cleaning Tasks
          </h3>
          <button
            type="button"
            onClick={handleOpenTaskModal}
            className="flex items-center gap-1 sm:gap-2 text-[#1F6FEB] font-medium cursor-pointer text-xs sm:text-sm"
          >
            <img src={plusIcon} alt="Add" className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Add Custom Task</span>
          </button>
        </div>
        
        {/* Default Tasks Checkboxes */}
        <div className="space-y-3 sm:space-y-4">
          {Object.keys(defaultTasks).map((task) => (
            <label
              key={task}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={defaultTasks[task]}
                onChange={() => handleDefaultTaskToggle(task)}
                className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-primary-500 border-gray-300 rounded cursor-pointer flex-shrink-0"
              />
              <span className="text-sm sm:text-base text-gray-900 font-medium flex-1 group-hover:text-primary-500 transition-colors">
                {task}
              </span>
            </label>
          ))}
        </div>

        {/* Custom Tasks Display */}
        {customTasks.length > 0 && (
          <div className="mt-4 space-y-2">
            {customTasks.map((task, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span className="text-xs sm:text-sm text-primary-500 font-medium pr-2 break-words flex-1">
                  {task}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomTask(index)}
                  className="text-red-500 hover:text-red-600 cursor-pointer flex-shrink-0"
                >
                  <img src={trashIcon} alt="Delete" className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions Section */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-primary-500 mb-3 sm:mb-4">
          Anything specific we should know?{' '}
          <span className="text-primary-200 font-medium text-xs sm:text-base">
            (Optional)
          </span>
        </h3>
        <div className="relative">
          <textarea
            value={instructions}
            onChange={handleInstructionsChange}
            placeholder="Write your instructions here in any...."
            rows={4}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-2xl! focus:outline-none text-xs sm:text-sm lg:text-base resize-none"
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

      {/* Add New Service Modal */}
      <AddTaskModal
        isOpen={showServiceModal}
        onClose={handleCloseServiceModal}
        onSave={handleSaveNewService}
        value={newServiceInput}
        onChange={handleNewServiceInputChange}
        title="Add New Service"
        description="List services by using a comma (,) between each one. e.g. Service 1, Service 2, Service 3"
        placeholder="Enter Service Name"
        saveButtonText="Add"
      />
    </div>
  );
};

export default HousekeepingJobDetailsForm;
