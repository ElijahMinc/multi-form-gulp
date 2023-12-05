document.addEventListener('DOMContentLoaded', async () => {
  const coursePageMultiFormConfig = {
    classOfFormWrapper: '.form',
    formId: 'form',
  }; //! COURSE PAGE

  async function initMultiСourseForm(configMultiForm) {
    const { classOfFormWrapper, formId } = configMultiForm;

    const formWrapper = document.querySelector(classOfFormWrapper);
    if (!formWrapper) return;

    const form = formWrapper.querySelector(`#${formId}`);
    const informationStepper = formWrapper.querySelector(
      '#informations-stepper'
    );
    const informationSteps = informationStepper.querySelectorAll(
      '.informations-stepper__item'
    );
    const sessionFromStorage = localStorage.getItem(
      `MULTI-FORM-${window.location.pathname}`
    );

    function deleteActiveInformationSteps() {
      informationSteps.forEach((step) =>
        step.classList.remove('informations-stepper__item-active')
      );
    }

    function activeInformationStep(step) {
      step.classList.add('informations-stepper__item-active');
    }

    if (form) {
      const userInfo = new IndexedDbService('userInfo', 1, {
        upgrade(db) {
          db.createObjectStore('userInfo');
        },
      });

      let user = null;
      let step = 0;

      if (sessionFromStorage) {
        const userSession = JSON.parse(sessionFromStorage);

        const currentDate = Date.now();
        const createdDate = userSession.created_date;
        const elapsedTime = currentDate - createdDate;

        const elapsedMinutes = elapsedTime / (1000 * 60); // translate to minutes;
        const remainingTimeInMinutes = 30; //30 minutes
        const remainingRefreshModalMinutes = 30240; // three weeks
        // const remainingRefreshModalMinutes = 2 //! three weeks for TEST

        const continueStep = informationSteps[0];
        const expiresStep = informationSteps[1];
        const successStep = informationSteps[2];

        if (elapsedMinutes <= remainingRefreshModalMinutes) {
          // If three weeks have NOT passed since registration

          if (userSession.isFullyRegistrationSuccess) {
            // If the user has successfully registered
            deleteActiveInformationSteps();
            activeInformationStep(successStep);
            toggleRenderForm();
            form.remove();

            return;
          }

          if (
            userSession.expiresFromServer ||
            elapsedMinutes >= remainingTimeInMinutes
          ) {
            // If the user is not registered to the end
            deleteActiveInformationSteps();
            activeInformationStep(expiresStep);
            toggleRenderForm();
            form.remove();
          } else {
            // Otherwise we get data from the storage and fix it for further logic
            deleteActiveInformationSteps();
            activeInformationStep(continueStep);

            step = userSession.step;
            user = await userInfo.get('info-course');
            // toggleRenderForm();
          }
        } else {
          // If three weeks have passed since registration
          localStorage.removeItem(`MULTI-FORM-${window.location.pathname}`);
        }
      }

      let userInfoFromSession = {
        user,
        step,
      };

      await multiFormLogic(userInfoFromSession);
    }

    async function multiFormLogic(userInfoFromSession) {
      const courseModalWrapper = document.querySelector('.course-modal');

      const spinner = document.querySelector('.spinner');
      const userFromSession = userInfoFromSession.user;
      const stepFromSession = userInfoFromSession.step;
      const userInfoIndexedDb = window['idb-userInfo'];
      const phoneMaskField = form.querySelector('#mobile-number');
      const phoneIti = initMaskForPhoneInput(phoneMaskField);
      const firstNameField = initMaskStringForField(
        document.querySelector('#first_name')
      );
      const lastNameField = initMaskStringForField(
        document.querySelector('#last_name')
      );
      const englishLevelSelect = '#english-level-select';
      const yearSelect = '#year-select';
      const $educationInput = new SearchInputWithList({
        rootEl: '[data-education-insitution-input]',
        initialData: [],
      });
      const $englishLevelSelect = form.querySelector(englishLevelSelect);
      const $yearSelect = form.querySelector(yearSelect);

      const englishLevelSelectOptions = [
        {
          label: 'A1',
          value: '4',
        },
        {
          label: 'A2',
          value: '5',
        },
        {
          label: 'B1',
          value: '6',
        },
        {
          label: 'B2',
          value: '7',
        },
        {
          label: 'C1',
          value: '8',
        },
        {
          label: 'C2',
          value: '9',
        },
      ];

      const yearSelectOptions = [
        {
          label: '1',
          value: '1',
        },
        {
          label: '2',
          value: '2',
        },
        {
          label: '3',
          value: '3',
        },
        {
          label: '4',
          value: '4',
        },
        {
          label: 'Finished Education',
          value: '7',
        },
      ];

      VirtualSelect.init({
        ele: $englishLevelSelect,
        multiple: false,
        search: false,
        required: true,
        hideClearButton: true,
        name: 'english-level',
        placeholder: 'English level',
        options: englishLevelSelectOptions,
        showDropboxAsPopup: false,
        focusSelectedOptionOnOpen: false,
      });

      //  VirtualSelect.init({
      //     ele: $educationSelect,
      //     // optionHeight: 'auto',
      //     multiple: false,
      //     // search: false,
      //     searchGroup: true,
      //     required: false,
      //     hideClearButton: true,
      //     name: 'education-institution',
      //     placeholder: 'Educational Institution',
      //     options: [],
      //     allowNewOption: true,
      //     showDropboxAsPopup: false,
      //     focusSelectedOptionOnOpen: false,
      //     additionalClasses: 'container-options-190px' //heigth * 2 = 95px * 2 = 190px

      //  });

      VirtualSelect.init({
        ele: $yearSelect,
        multiple: false,
        search: false,
        required: true,
        hideClearButton: true,
        name: 'year',
        placeholder: 'Year',
        options: yearSelectOptions,
        showDropboxAsPopup: false,
        focusSelectedOptionOnOpen: false,
      });

      function showSpinner() {
        spinner.classList.add('show');
      }

      function hideSpinner() {
        spinner.classList.remove('show');
      }

      const file = new AttachFile('upload-file', {
        handleChangeValidateInput: (fileInput) => {
          const { error, errorMessage } =
            multiForm.handleValidateInput(fileInput);
          if (!!error) {
            throw new Error(errorMessage);
          }
        },
        handleSuccessAttach: (fileInput) => {
          const fileWrapper = fileInput.closest('#upload-file');

          fileWrapper.setAttribute('data-attach', '');

          window.MultiForm.setSuccess(fileInput);
        },
        handleCanceled: (fileInput) => {
          const fileWrapper = fileInput.closest('#upload-file');
          fileWrapper.removeAttribute('data-attach');
          window.MultiForm.removeSuccess(fileInput);

          if (fileInput.classList.contains('._validate')) {
            fileWrapper.classList.remove(MultiForm.NO_VALID_CLASS);
          }
        },
      });

      const multiForm = new window.MultiForm(formId, {
        currentStep: stepFromSession || 0,
        handleSuccessNextStep: async (formData, currentStep) => {

          const userData = userFromSession
            ? { ...userFromSession, ...formData }
            : formData;
          const allUserData = await userInfoIndexedDb.get('info-course');

          const data = { ...allUserData, ...userData };
          await userInfoIndexedDb.set('info-course', data);

          localStorage.setItem(
            `MULTI-FORM-${window.location.pathname}`,
            JSON.stringify({
              created_date: Date.now(),
              step: currentStep + 1,
              isFullyRegistrationSuccess: false,
              expiresFromServer: false,
            })
          );

          showSpinner();

          try {

            await sendUserInfo(data);
          } catch (error) {
   
          } finally {
            hideSpinner();
          }
        },
        handleSubmit: async (formData, currentStep) => {
          const userData = userFromSession
            ? { ...userFromSession, ...formData }
            : formData;

          const allUserData = await userInfoIndexedDb.get('info-course');

          let data = { ...allUserData };

          localStorage.setItem(
            `MULTI-FORM-${window.location.pathname}`,
            JSON.stringify({
              created_date: Date.now(),
              step: currentStep,
              isFullyRegistrationSuccess: false,
              expiresFromServer: false,
            })
          );

          showSpinner();

          try {
            await sendUserInfo(data);

            const successStep = informationSteps[2];

            deleteActiveInformationSteps();
            activeInformationStep(successStep);
            toggleRenderForm();
            form.remove();

            localStorage.setItem(
              `MULTI-FORM-${window.location.pathname}`,
              JSON.stringify({
                created_date: Date.now(),
                step: currentStep,
                isFullyRegistrationSuccess: true,
                expiresFromServer: false,
              })
            );

            await userInfoIndexedDb.del('info-course');
          } catch (error) {

          } finally {
            hideSpinner();
          }
        },
        setValueOnInit: (input, valueFromInitData) => {
          if (input.type === 'tel') {
            phoneIti.setNumber(valueFromInitData);
          }

          if (input.type === 'file') {
            const fileData = userFromSession?.[input.name] || null;

            if (!fileData) return;

            file.setSuccessfulyUploadedStatus(fileData);
          }
        },
        initFormData: userFromSession,
      });

      async function getUniversities() {
        // $educationSelect.classList.add('_after-prefetch');
        //! we dont want validate input after getting options by change event

        await $.ajax({
          url: `${window.location.origin}/wp-json/course_form/v1/universities`,
          type: 'GET',
          success: function (options) {
            //TODO
            // $educationSelect.setOptions(options);
            $educationInput.setListData(options);
            //! thats why we removed class '_after-prefetch'

            if (userFromSession && 'education-institution' in userFromSession) {
              $educationInput.value = userFromSession['education-institution'];
            }
          },
          error: function (response) {},
        });
      }



      async function sendUserInfo(data) {
        const body = new FormData();

        Object.entries(data).forEach(([name, value]) => {
          if (!value) return;

          if (data[name] instanceof File) {
            body.append(name, value);

            return;
          }

          if (typeof data[name] === 'object') {
            body.append(name, JSON.stringify(value));

            return;
          }

          body.append(name, value);
        });

        return new Promise((res, rej) => setTimeout(res, 1500));
        // return await $.ajax({
        //   url: `${window.location.origin}/wp-json/course_form/v1/save`,
        //   type: 'POST',
        //   data: body,
        //   processData: false,
        //   contentType: false,
        //   success: async function (response) {},
        //   error: function (rejectResponse) {},
        // });
      }

      function initMaskStringForField(input) {
        if (!input) return;

        return window.IMask(input, {
          mask: /^[a-zA-Zа-яА-Я\s-]*$/,
        });
      }

      function initMaskForPhoneInput(phoneInput) {
        if (!phoneInput) return;

        const phoneIti = intlTelInput(phoneInput, {
          utilsScript:
            'https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js',
          allowDropdown: true,
          autoHideDialCode: false,
          autoPlaceholder: 'aggressive',
          customPlaceholder: null,
          dropdownContainer: null,
          formatOnDisplay: true,
          geoIpLookup: function (callback) {
            callback('hu');
          },
          hiddenInput: '',
          initialCountry: 'auto',
          localizedCountries: null,
          nationalMode: false,
          onlyCountries: [],
          placeholderNumberType: 'MOBILE',
          preferredCountries: ['hu'],
          excludeCountries: ['ru'],
          separateDialCode: false,
        });

        phoneIti.promise.then(() => {
          const plus = '+';
          const defaultMask = `${plus}000000000000`;
          const instance = setMask(phoneInput, `${plus}000000000000`);

          function updateMask() {
            const placeholder = phoneInput.getAttribute('placeholder');
            let mask = plus;

            if (!!placeholder && !!placeholder.length) {
              const value = placeholder.replaceAll('-', ' ');
              let cleanPhoneMask = value
                .replace(/\D+/g, '')
                .split('')
                .map(() => '0')
                .join('');
              mask = `${plus}${cleanPhoneMask}`;
            }

            instance.updateOptions({ mask: !placeholder ? defaultMask : mask });
          }

          updateMask();

          phoneInput.addEventListener('input', updateMask);
        });

        function setMask(input, mask) {
          return window.IMask(input, {
            mask,
            placeholderChar: '_',
            lazy: false,
          });
        }

        return phoneIti;
      }

      function initMaskForDateInput() {
        const dateOfBirthMaskField = form.querySelector('#date-of-birth');
        if (!dateOfBirthMaskField) return;

        IMask(dateOfBirthMaskField, {
          mask: Date,
          pattern: 'YYYY.MM.DD',
          lazy: false,
          blocks: {
            YYYY: {
              mask: IMask.MaskedRange,
              from: 1932,
              to: 2090,
              placeholderChar: 'Y',
            },
            MM: {
              mask: IMask.MaskedRange,
              from: 1,
              to: 12,
              placeholderChar: 'M',
            },
            DD: {
              mask: IMask.MaskedRange,
              from: 1,
              to: 31,
              placeholderChar: 'D',
            },
          },
          format: function (date) {
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();

            if (day < 10) {
              day = '0' + day;
            }
            if (month < 10) {
              month = '0' + month;
            }

            return year + '.' + month + '.' + day;
          },
          parse: function (str) {
            const yearMonthDay = str.split('.');
            const year = parseInt(yearMonthDay[0], 10);
            const month = parseInt(yearMonthDay[1], 10) - 1;
            const day = parseInt(yearMonthDay[2], 10);
            return new Date(year, month, day);
          },
        });

        return dateOfBirthMaskField;
      }

      function courseModalLogic() {
        const courseForm = document.querySelector('#course-form');

        if (!courseForm) return;

        const modalWindow = courseModalWrapper.querySelector('.modal-window');
        const closeBtn = courseModalWrapper.querySelector(
          '.modal-box__btn-close'
        );

        closeBtn.removeEventListener('click', handleCloseModal);
        modalWindow.removeEventListener('click', handleCloseModalByModalWindow);

        let isSecondAttemptToCloseModal = false;

        const cancelBtn = informationStepper.querySelector(
          '[data-btn="cancel"]'
        );

        function handleInformationSteps(e) {
          const target = e.target;

          if (!target.matches('[data-btn]')) return;

          const btn = target.dataset.btn;

          const continueBtn = btn === 'continue';
          const cancelBtn = btn === 'cancel'; //??? what happen when i click cancel btn????

          if (continueBtn) {
            toggleRenderForm();
            isSecondAttemptToCloseModal = false;
          }
        }

        function handleCloseCourseModal() {
          if (isSecondAttemptToCloseModal) {
            handleCloseModal.call(modalWindow);
            isSecondAttemptToCloseModal = false;
            toggleRenderForm();
          } else {
            renderContinuePopup();
            isSecondAttemptToCloseModal = true;
          }
        }

        cancelBtn.addEventListener('click', handleCloseCourseModal);
        modalWindow.addEventListener('click', (e) => {
          if (
            e.target.closest('.modal-box') ||
            !e.target.closest('.modal-window')
          )
            return;

          handleCloseCourseModal();
        });
        closeBtn.addEventListener('click', handleCloseCourseModal);

        informationStepper.addEventListener('click', handleInformationSteps);
      }

      initMaskForDateInput();
      // await getUniversities();
      courseModalLogic();
    }

    function renderContinuePopup() {
      form.classList.add('hide');
      informationStepper.classList.remove('hide');
    }

    function toggleRenderForm() {
      form.classList.toggle('hide');
      informationStepper.classList.toggle('hide');
    }
  }

  await initMultiСourseForm(coursePageMultiFormConfig);
});
