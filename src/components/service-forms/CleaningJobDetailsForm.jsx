import React, { useState } from 'react';
import { Button, FloatingLabelInput } from '../form-controls';
import AddTaskModal from './common/AddTaskModal';
import uploadIcon from '../../assets/upload-cloud.svg';
import PlusIcon from '../../assets/plus2.svg';
import DeleteIcon from '../../assets/trash-red.svg';

const CleaningJobDetailsForm = ({ 
  formData, 
  onInputChange, 
  selectedFiles = [],
  onDrag,
  onDrop,
  dragActive,
  uploadError,
  onFileInputChange,
  onRemoveFile, 
  isBondCleaning = false,
  onBondCleaningToggle
}) => {
  const [customTasks, setCustomTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskInput, setTaskInput] = useState('');

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

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Property Details Section */}
      <div>
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-primary-500 mb-2">
          Tell us about your property
        </h2>
        <p className="text-xs sm:text-sm lg:text-base text-primary-200 font-medium mb-4 sm:mb-6">
          Add property details to ensure the best cleaning plan for you.
        </p>

        {/* Bond Cleaning Toggle */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <span className="text-xs sm:text-sm font-medium text-primary-500 mr-4">Is this job for bond cleaning?</span>
          <button
            type="button"
            onClick={onBondCleaningToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
              isBondCleaning ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isBondCleaning ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Property Type - Text Field */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-primary-500 mb-2">
            Property Type
          </label>
          <input
            type="text"
            value={formData.propertyType || ''}
            onChange={(e) => onInputChange('propertyType', e.target.value)}
            placeholder="e.g., House, Apartment, Office"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E5E7EB] rounded-lg focus:outline-none text-xs sm:text-sm lg:text-base bg-white text-primary-500 placeholder:text-primary-200"
          />
        </div>
      </div>

      {/* Property Size Section */}
      <div className="">
        <div className="block text-xs sm:text-sm font-medium text-primary-500 mb-2">
          Property Size
        </div>
        <FloatingLabelInput
          id="propertySize"
          name="propertySize"
          label="Property Size"
          type="text"
          value={formData.propertySize}
          onChange={(e) => onInputChange('propertySize', e.target.value)}
          placeholder=" "
          required
        />
        <p className="text-xs text-primary-200 font-medium mt-1">Enter the size or description of your property (1-100 characters)</p>
      </div>

      {/* Cleaning Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-primary-500">Cleaning Tasks</h3>
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
        
        {/* Display Added Tasks */}
        {customTasks.length > 0 && (
          <div className="space-y-2">
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

      {/* Upload Section */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-primary-500 mb-3 sm:mb-4">
          Upload Photos <span className="text-primary-200 font-medium text-xs sm:text-base"> (Optional)</span>
        </h3>

        {uploadError && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-xs sm:text-sm">
            {uploadError}
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors cursor-pointer ${
            dragActive ? 'border-primary-500 bg-primary-50' : 'border-[#D1D3D8] hover:border-primary-500'
          }`}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            multiple
            onChange={onFileInputChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className={`rounded-full p-3 sm:p-4 ${dragActive ? 'bg-primary-500' : 'bg-primary-200'}`}>
              <img
                src={uploadIcon}
                alt="Upload"
                className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
              />
            </div>
            <div>
              <p className="text-xs sm:text-sm lg:text-base text-primary-500 font-medium mb-2">
                {dragActive ? 'Drop files here' : 'Select photos to upload'}
              </p>
              <Button
                type="button"
                size="sm"
                className="mx-auto bg-primary-500 text-white text-xs sm:text-sm"
              >
                Upload Here
              </Button>
            </div>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs sm:text-sm font-medium text-primary-500 mb-2 sm:mb-3">
              Selected Files ({selectedFiles.length}/10)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 sm:h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <Button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    variant="danger"
                    size="xs"
                    className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </Button>
                  <p className="text-xs text-gray-500 mt-1 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instructions Section */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-primary-500 mb-3 sm:mb-4">
          Anything specific we should know? <span className="text-primary-200 font-medium text-xs sm:text-base"> (Optional)</span>
        </h3>
        <div className="relative">
          <textarea
            value={formData.instructions}
            onChange={(e) => onInputChange('instructions', e.target.value)}
            placeholder="Write your instructions here in any..."
            rows={3}
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
    </div>
  );
};

export default CleaningJobDetailsForm;

