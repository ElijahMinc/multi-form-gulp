document.addEventListener('DOMContentLoaded', () => {
	class MultiForm {
		ACTIVE_FORM_STEP_CLASS = 'form__step-active';
		ACTIVE_PROGRESS_STEP_CLASS = 'progressbar-step-active';
		static NO_VALID_CLASS = 'no-valid';
  
		options = {
		  currentStep: 0,
		  handleSuccessNextStep: async (formData, currentStep) => {},
		  handleSubmit: async (formData, currentStep) => {},
		  setValueOnInit: (input, valueFromInitData) => {},
		  customValidateByStep: (inputField) => {}, // must return boolean
		  customValidateField: ({ input, errorMessage }) => {}, // { input, error: errorCounter, errorMessage }
		  initFormData: null,
		};
  
		constructor(
		  formId,
		  options = {
			 currentStep: 0,
			 handleSuccessNextStep: async (formData, currentStep) => {},
			 handleSubmit: async (formData, currentStep) => {},
			 setValueOnInit: (input, valueFromInitData) => {},
			 customValidateField: ({ input, errorMessage }) => {}, // { input, error: errorCounter, errorMessage }
			 initFormData: null,
		  }
		) {
		  this.$form = document.querySelector(`#${formId}`);
		  if (!this.$form) return; //! We are not working without form which are wrapper for all logic!
  
		  this.$steps = [...this.$form.querySelectorAll('[data-step]')];
		  this.$progressSteps = [
			 ...this.$form.querySelectorAll('.progressbar-step'),
		  ];
		  this.$stepper = this.$form.querySelector('.stepper');
		  this.options = options;
  
		  this.currentStep =
			 this.options?.currentStep ??
			 this.$steps.findIndex((e) =>
				e.classList.contains(this.ACTIVE_FORM_STEP_CLASS)
			 );
  
		  if (this.options?.currentStep < 0) {
			 this.currentStep = 0;
			 this.$steps[this.currentStep].classList.add(
				this.ACTIVE_FORM_STEP_CLASS
			 );
		  }
  
		  this.#setup();
  
		  this.initForm(this.options.initFormData);
		}
  
		renderSteps() {
		  this.$steps.forEach((step, index) => {
			 step.classList.toggle(
				this.ACTIVE_FORM_STEP_CLASS,
				index === this.currentStep
			 );
		  });
		}
  
		renderProgress() {
		  this.$progressSteps.forEach((progressStep, index) => {
			 progressStep.classList.toggle(
				this.ACTIVE_PROGRESS_STEP_CLASS,
				index === this.currentStep
			 );
		  });
		}
  
		triggerSubmitByStep(step) {
		  const stepContainer = this.$form.querySelector(`[data-step="${step}"]`);
		  if (!stepContainer) return;
  
		  const btnSubmit = stepContainer.querySelector('[data-btn="submit"]');
  
		  btnSubmit.click();
		}
  
		getRequireInputsByStep(step) {
		  const stepContainer = this.$form.querySelector(`[data-step="${step}"]`);
		  const requiredFields = stepContainer.querySelectorAll('._require');
  
		  return requiredFields;
		}
  
		getAllFieldsByStep(step) {
		  const stepContainer = this.$form.querySelector(`[data-step="${step}"]`);
		  const requiredFields = stepContainer.querySelectorAll('._field');
  
		  return requiredFields;
		}
  
		async handleSteps(e) {
		  const target = e.target;
  
		  if (!target.matches('[data-btn]')) return;
  
		  let incrementor = 0;
  
		  const btn = target.dataset.btn;
		  const prevBtn = btn === 'prev';
		  const nextPrev = btn === 'next';
		  const submitBtn = btn === 'submit';
  
		  function getInputFromWrapperBlock(requiredBlock) {
			 let input = requiredBlock.querySelector('input');
  
			 if (requiredBlock.classList.contains('fields-block__textarea')) {
				input = requiredBlock.querySelector('textarea');
			 }
  
			 if (!input) return null;
  
			 return input;
		  }
  
		  const getValuesByStep = async (step) => {
			 const data = {};
			 const isValidStep = this.getValidateForm();
			 const fieldBlocks = this.getAllFieldsByStep(step + 1);
  
			 if (!isValidStep) {
				const requiredFieldBlocks = this.getRequireInputsByStep(step + 1);
  
				requiredFieldBlocks.forEach((requiredBlock) => {
				  const input = getInputFromWrapperBlock(requiredBlock);
  
				  if (!input) return;
				  this.handleValidateInput(input);
				});
  
				return { data, isValid: false };
			 }
  
			 function setInputValue(
				input,
				validateCb = (inputName, inputValue) => {
				  return true; // by default
				} // you must returned true or false for set input
			 ) {
				const inputName = input.name;
				const inputValue = input.value;
  
				if (input.type === 'radio') {
				  const fieldBlock = input.closest('._field');
				  const radios = fieldBlock.querySelectorAll('input');
				  const checkedRadio = Array.from(radios).find(
					 (radio) => radio.checked
				  );
  
				  const isSetValueEnabled = validateCb(
					 inputName,
					 checkedRadio?.value
				  );
  
				  if (!isSetValueEnabled) return;
  
				  data[inputName] = checkedRadio?.value || '';
				  return;
				}
  
				if (input.type === 'file') {
				  const isSetValueEnabled = validateCb(inputName, input.files[0]);
  
				  if (!isSetValueEnabled) return;
  
				  data[inputName] = input.files[0];
  
				  return;
				}
  
				const isSetValueEnabled = validateCb(inputName, inputValue);
  
				if (!isSetValueEnabled) return;
  
				data[inputName] = inputValue;
			 }
  
			 const validateInputCb = (inputName, inputValue) => {
				try {
				  const isCustomSetValueEnabled = this.options.customValidateByStep?.(
					 inputName,
					 inputValue
				  );
				  return isCustomSetValueEnabled ?? true;
				} catch (er) {
				  // or we can THROW error
				  return false;
				}
			 };
  
			 fieldBlocks.forEach((fieldBlock) => {
				if (fieldBlock.classList.contains('_require')) {
				  const input = getInputFromWrapperBlock(fieldBlock);
				  if (!input) return;
  
				  setInputValue(input, validateInputCb);
				} else {
				  const input = getInputFromWrapperBlock(fieldBlock);
				  const isValidByDefault = true;
				  setInputValue(input, () => isValidByDefault);
				}
			 });
  
			 return { data, isValid: true };
		  };
  
		  if (submitBtn) {
			 const { isValid, data } = await getValuesByStep(this.currentStep);
			 if (!isValid) return;
			 //?? CALLBACK
  
			 this.options.handleSubmit?.(data, this.currentStep);
			 //  const userData = userFromSession ? {...userFromSession, ...userInfoData} : userInfoData;
  
			 //  await userInfoIndexedDb.set('info', userData);
			 return;
		  }
  
		  if (nextPrev) {
			 const { isValid, data } = await getValuesByStep(this.currentStep);
  
			 if (!isValid) return;
			 //?? CALLBACK
			 await this.options.handleSuccessNextStep?.(data, this.currentStep);
			 //  const userData = userFromSession ? {...userFromSession, ...userInfoData} : userInfoData;
			 //  await userInfoIndexedDb.set('info', userData);
  
			 //  localStorage.setItem(`COURSE_FORM_STEP-${window.location.pathname}`, JSON.stringify({
			 //      created_date: Date.now(),
			 //      step: currentStep + 1
			 //  }));
  
			 incrementor = 1;
		  }
  
		  if (prevBtn) {
			 incrementor = -1;
		  }
  
		  this.currentStep += incrementor;
  
		  this.renderSteps();
		  this.renderProgress();
		}
  
		static getRequireFieldBlock(input) {
		  if (input.classList.contains('_require')) return input;
  
		  const requireFieldBlock = input.closest('._require');
		  return requireFieldBlock;
		}
  
		static getValidateFieldBlock(input) {
		  if (input.classList.contains('_field')) return input;
  
		  const validateFieldBlock = input.closest('._field');
		  return validateFieldBlock;
		}
  
		static setSuccess(input) {
		  let fieldBlock = MultiForm.getRequireFieldBlock(input);
  
		  if (!fieldBlock) {
			 let validatedFieldInAnyCase = MultiForm.getValidateFieldBlock(input);
  
			 fieldBlock = validatedFieldInAnyCase;
		  }
  
		  if (!fieldBlock) return;
  
		  fieldBlock.setAttribute('data-success', '');
		}
  
		static cancelError(input) {
		  let fieldBlock = MultiForm.getRequireFieldBlock(input);
  
		  if (!fieldBlock) {
			 let validatedFieldInAnyCase = MultiForm.getValidateFieldBlock(input);
  
			 fieldBlock = validatedFieldInAnyCase;
		  }
  
		  if (!fieldBlock) return;
  
		  const errorMessage = fieldBlock.querySelector(
			 '.fields-block__no-valid-message'
		  );
  
		  if (fieldBlock.classList.contains(MultiForm.NO_VALID_CLASS)) {
			 fieldBlock.classList.remove(MultiForm.NO_VALID_CLASS);
		  }
  
		  MultiForm.setSuccess(input);
  
		  if (!errorMessage) return;
		  errorMessage.style.display = 'none';
		}
  
		static removeSuccess(input) {
		  let fieldBlock = MultiForm.getRequireFieldBlock(input);
  
		  if (!fieldBlock) {
			 let validatedFieldInAnyCase = MultiForm.getValidateFieldBlock(input);
  
			 fieldBlock = validatedFieldInAnyCase;
		  }
  
		  fieldBlock.removeAttribute('data-success');
		}
  
		static setError(input, messageError) {
		  let fieldBlock = MultiForm.getRequireFieldBlock(input);
  
		  if (!fieldBlock) {
			 let validatedFieldInAnyCase = MultiForm.getValidateFieldBlock(input);
  
			 fieldBlock = validatedFieldInAnyCase;
		  }
  
		  if (!fieldBlock) return;
  
		  const errorMessage = fieldBlock.querySelector(
			 '.fields-block__no-valid-message'
		  );
  
		  if (fieldBlock.classList.contains(MultiForm.NO_VALID_CLASS)) return;
  
		  fieldBlock.classList.add(MultiForm.NO_VALID_CLASS);
		  MultiForm.removeSuccess(input);
  
		  if (!errorMessage) return;
  
		  errorMessage.style.display = 'block';
		  errorMessage.textContent = messageError ?? '';
		}
  
		getValidateForm() {
		  const currentStepContainer = this.$form.querySelector(
			 `[data-step="${this.currentStep + 1}"]`
		  );
  
		  function checkRequiredFieldsByCurrentStep() {
			 const requiredFields =
				currentStepContainer.querySelectorAll('._require');
			 const filledRequiredFields = Array.from(requiredFields).every((field) =>
				field.hasAttribute('data-success')
			 );
  
			 const validateFields =
				currentStepContainer.querySelectorAll('._validate');
  
			 if (!!validateFields.length) {
				const filledValidateFields = Array.from(validateFields).every(
				  (validateField) => {
					 const validateFieldsWrapper = validateField.closest('._field');
					 return validateFieldsWrapper.hasAttribute('data-success');
				  }
				);
  
				return filledRequiredFields && filledValidateFields;
			 }
  
			 return filledRequiredFields;
		  }
  
		  return checkRequiredFieldsByCurrentStep();
		}
		static setEmpty(input) {
		  let fieldBlock = MultiForm.getRequireFieldBlock(input);
  
		  if (!fieldBlock) {
			 let validatedFieldInAnyCase = MultiForm.getValidateFieldBlock(input);
  
			 fieldBlock = validatedFieldInAnyCase;
		  }
  
		  if (!fieldBlock) return;
  
		  fieldBlock.setAttribute('data-empty', '');
		}
  
		static notEmpty(input) {
		  let fieldBlock = MultiForm.getRequireFieldBlock(input);
  
		  if (!fieldBlock) {
			 let validatedFieldInAnyCase = MultiForm.getValidateFieldBlock(input);
  
			 fieldBlock = validatedFieldInAnyCase;
		  }
  
		  if (!fieldBlock) return;
  
		  fieldBlock.removeAttribute('data-empty');
		}
  
		handleValidateInput(input) {
		  const { error, errorMessage, isEmpty } = MultiForm.validateFields([
			 input,
		  ]);
  
		  !!error
			 ? MultiForm.setError(input, errorMessage)
			 : MultiForm.cancelError(input);
  
		  isEmpty ? MultiForm.setEmpty(input) : MultiForm.notEmpty(input);
  
		  return { error, errorMessage };
		}
  
		initForm(initData) {
		  if (!initData) return;
  
		  this.$steps.forEach((_, formIdx) => {
			 const step = formIdx + 1;
			 const fieldBlocks = this.getAllFieldsByStep(step);
  
			 fieldBlocks.forEach((fieldBlock) => {
				let input = fieldBlock.querySelector('input');
  
				if (fieldBlock.classList.contains('fields-block__textarea')) {
				  input = fieldBlock.querySelector('textarea');
				}
  
				if (!input) return;
  
				const inputName = input.name;
  
				const valueFromInitDataByInputName = initData?.[inputName] || '';
  
				if (!valueFromInitDataByInputName) return;
  
				if (input.classList.contains('vscomp-hidden-input')) {
				  const vcCompCustomSelect = input.closest('.vscom-custom-select');
				  vcCompCustomSelect.setValue(valueFromInitDataByInputName);
				  MultiForm.setSuccess(input);
  
				  this.options?.setValueOnInit(input);
				  return;
				}
  
				if (input.type === 'tel') {
				  this.options?.setValueOnInit(input, valueFromInitDataByInputName);
				  MultiForm.setSuccess(input);
				  return;
				}
  
				if (input.type === 'file') {
				  this.options?.setValueOnInit(input);
				  //! INIT FILE
				  return;
				}
  
				const inputByName = this.$form.querySelectorAll(
				  `[name="${inputName}"`
				);
  
				if (inputByName.length === 1) {
				  inputByName[0].value = valueFromInitDataByInputName;
				  this.options?.setValueOnInit(input);
				  MultiForm.setSuccess(input);
  
				  if (input.type === 'checkbox') {
					 input.checked = true;
				  }
  
				  return;
				}
  
				if (inputByName.length > 1) {
				  const inputs = inputByName;
				  const isRadio = inputs[0].type === 'radio';
  
				  if (isRadio) {
					 inputs.forEach((inp) => {
						if (inp.value === valueFromInitDataByInputName) {
						  inp.checked = true;
						  MultiForm.setSuccess(inp);
						}
					 });
				  }
				  return;
				}
			 });
		  });
		}
  
		static isInvalidFormat(file, validFormats) {
		  const formats = validFormats || [
			 'application/x-dosexec',
			 'application/x-httpd-php',
			 'application/macbinary',
			 'application/javascript',
			 'application/postscript',
			 'application/x-msdownload',
			 'application/x-sql',
			 'application/sql',
			 'application/octet-stream',
			 'application/xml',
			 'application/bat',
			 'application/x-bat',
			 'application/x-msdos-program',
			 'application/x-python-code',
			 'chemical/x-cmdf',
			 'text/html',
			 'text/x-script.phyton',
			 'text/javascript',
			 'text/x-python-script',
			 'text/x-python',
			 'text/sql',
			 'text/x-sql',
			 'text/x-php',
			 'text/asp',
		  ];
  
		  return formats.includes(file.type);
		}
  
		static isInvalidSize(file, validMb = 20) {
		  return file.size > validMb * 1024 * 1024 || file.size === 0;
		}
  
		static emailTest(input) {
		  return !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
			 input.value
		  );
		}
  
		isAllFieldsFilled() {
		  const allFields = this.getAllFieldsByStep(this.currentStep + 1);
		  return Array.from(allFields).every(
			 (field) => !field.hasAttribute('data-empty')
		  );
		}
  
		static validateFields(inputs) {
		  let error = 0;
		  let isEmpty = false;
		  let invalidField = null;
		  let errorMessage = '';
  
		  inputs.forEach((input) => {
			 this.cancelError(input);
			 const isNotRequiredButMustValidate =
				input.classList.contains('_validate') || !input.closest('._require');
  
			 if (!input.value.length && !isNotRequiredButMustValidate) {
				++error;
				errorMessage = 'Required field';
				isEmpty = true;
  
				if (input.name === 'english-level') {
				  errorMessage = 'Chose your English level';
				}
  
				if (
				  input.name === 'education-institution' &&
				  !isNotRequiredButMustValidate
				) {
				  errorMessage = 'Choose or enter your Educational Institution';
				}
  
				if (input.name === 'year') {
				  errorMessage = 'Choose your year';
				}
			 }
  
			 if (!input.value && isNotRequiredButMustValidate) {
				errorMessage = '';
				error = 0;
			 }
  
			 if (input.type === 'radio') {
				const wrapperContainer = MultiForm.getRequireFieldBlock(input);
  
				if (!wrapperContainer) return;
  
				const isSomeoneChecked = Array.from(
				  wrapperContainer.querySelectorAll('input')
				).some((input) => input.checked);
  
				if (!isSomeoneChecked && !isNotRequiredButMustValidate) {
				  isEmpty = true;
				  invalidField = input;
				  ++error;
				  errorMessage = '';
				}
			 }
  
			 if (input.type === 'email') {
				if (MultiForm.emailTest(input)) {
				  isEmpty = false;
				  invalidField = input;
  
				  ++error;
				  errorMessage = 'Invalid email';
				}
  
				if (!input.value.length && !isNotRequiredButMustValidate) {
				  isEmpty = true;
				  invalidField = input;
  
				  ++error;
				  errorMessage = 'Required field';
				}
			 }
  
			 if (input.type === 'file') {
				const file = input.files[0];
				if (!file) {
				  isEmpty = true;
				}
  
				if (!file && !isNotRequiredButMustValidate) {
				  ++error;
				  errorMessage = '';
				} else if (MultiForm.isInvalidFormat(file)) {
				  ++error;
				  errorMessage = 'Invalid format';
				  invalidField = input;
  
				  isEmpty = false;
				} else if (MultiForm.isInvalidSize(file)) {
				  ++error;
				  errorMessage = 'File is too large';
				  invalidField = input;
  
				  isEmpty = false;
				}
			 }
  
			 if (input.type === 'text' && !input.matches('[data-date-of-birth]')) {
				if (!input.value.length && !isNotRequiredButMustValidate) {
				  ++error;
				  invalidField = input;
  
				  errorMessage = 'Required field';
				  isEmpty = true;
				} else {
				  isEmpty = false;
				}
  
				if (input.name === 'speciality') {
				  isEmpty = true;
				  errorMessage = 'Enter your Specialty';
				}
  
				if (input.name === 'education-institution') {
				  isEmpty = true;
				  errorMessage = 'Choose or enter your Educational Institution';
				}
			 }
  
			 if (input.matches('[data-date-of-birth]')) {
				const currentDate = new Date();
				const minDate = new Date('1952-12-01');
  
				const selectedDate = input.value;
  
				if (isNotRequiredButMustValidate && selectedDate === 'YYYY.MM.DD') {
				  isEmpty = true;
				  return;
				}
  
				if (selectedDate.length !== 10) {
				  isEmpty = true;
				  ++error;
				  invalidField = input;
  
				  errorMessage = 'Required field';
				} else {
				  isEmpty = false;
				}
  
				if (
				  selectedDate.includes('M') ||
				  selectedDate.includes('D') ||
				  selectedDate.includes('Y')
				) {
				  isEmpty = false;
				  invalidField = input;
  
				  ++error;
				  errorMessage = 'Invalid date of birth';
				}
  
				if (
				  new Date(selectedDate) > currentDate ||
				  new Date(selectedDate) < minDate
				) {
				  isEmpty = false;
				  invalidField = input;
  
				  ++error;
				  errorMessage = 'Invalid date of birth';
				}
			 }
  
			 if (input.matches('[data-age]')) {
				let selectedValue = parseInt(input.value);
  
				if (isNaN(selectedValue)) {
				  selectedValue = 0;
				}
  
				if (isNotRequiredButMustValidate && selectedValue === 0) {
				  isEmpty = true;
  
				  error = 0;
				  errorMessage = '';
  
				  return;
				}
  
				if (selectedValue === 0) {
				  isEmpty = true;
				  invalidField = input;
  
				  ++error;
				  errorMessage = 'Required field';
				} else {
				  isEmpty = false;
				}
			 }
  
			 if (input.matches('[data-course-tel]')) {
				const emptyFieldRegex = /^[^0-9]*$/;
				const phoneValue = input.value;
  
				if (phoneValue.includes('_')) {
				  isEmpty = false;
				  invalidField = input;
  
				  ++error;
				  errorMessage = 'Invalid phone';
				}
  
				if (emptyFieldRegex.test(phoneValue)) {
				  isEmpty = true;
				  invalidField = input;
  
				  ++error;
				  errorMessage = 'Required field';
				} else {
				  isEmpty = false;
				}
			 }
  
			 if (input.matches('[data-vacancy-tel]')) {
				const emptyFieldRegex = /^[^0-9]*$/;
				const phoneValue = input.value;
  
				const secondPartValue = phoneValue.split(' ')[1];
  
				if (emptyFieldRegex.test(secondPartValue)) {
				  if (isNotRequiredButMustValidate) return;
  
				  isEmpty = true;
				  invalidField = input;
				  ++error;
				  errorMessage = 'Required field';
  
				  return;
				}
  
				if (secondPartValue.includes('_')) {
				  isEmpty = false;
				  invalidField = input;
				  ++error;
				  errorMessage = 'Invalid phone';
				}
			 }
  
			 if (
				input.type === 'checkbox' ||
				input.matches('[data-checkbox-privacy-policy]')
			 ) {
				const isChecked = input.checked;
  
				if (isNotRequiredButMustValidate) return;
  
				if (!isChecked) {
				  isEmpty = true;
				  invalidField = input;
  
				  ++error;
				  errorMessage = '';
				} else {
				  isEmpty = false;
				}
			 }
		  });
		  return { error, errorMessage, isEmpty };
		}
  
		#setup() {
		  this.$form.querySelectorAll('input').forEach((input) => {
			 if (input.classList.contains('vscomp-search-input')) return;
  
			 switch (input.type) {
				case 'checkbox':
				  input.addEventListener('change', () =>
					 this.handleValidateInput(input)
				  );
				  break;
  
				case 'radio':
				  input.addEventListener('change', () =>
					 this.handleValidateInput(input)
				  );
				  break;
  
				case 'hidden':
				  const vscompInputHidden = input.classList.contains(
					 'vscomp-hidden-input'
				  );
				  if (!vscompInputHidden) break;
  
				  const vscomCustomSelect = input.closest('.vscom-custom-select');
  
				  vscomCustomSelect.addEventListener('change', () => {
					 if (vscomCustomSelect.classList.contains('_after-prefetch')) {
						vscomCustomSelect.classList.remove('_after-prefetch');
						return;
					 }
  
					 const hiddenInput = vscomCustomSelect.querySelector(
						'input[type="hidden"]'
					 );
					 this.handleValidateInput(hiddenInput);
				  });
				  break;
  
				default:
				  input.addEventListener('blur', () =>
					 this.handleValidateInput(input)
				  );
			 }
		  });
		  this.$form
			 .querySelectorAll('textarea')
			 .forEach((textarea) =>
				textarea.addEventListener('blur', () =>
				  this.handleValidateInput(textarea)
				)
			 );
  
		  this.$stepper.addEventListener('click', this.handleSteps.bind(this));
  
		  this.renderSteps();
		  this.renderProgress();
		}
	 }
  
	 window.MultiForm = MultiForm;
  
})
 
