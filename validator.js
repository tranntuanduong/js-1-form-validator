function Validator (options) {

    function getParent (element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            } 
            element = element.parentElement;
        }
    }

    var selectorRules = []

    function validate (inputElement, rule) {
       
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage;

        var rules = selectorRules[rule.selector]

        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
           
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }
        return !errorMessage;
    }

    var formElement = document.querySelector(options.form)

    if (formElement) {

        // Xử lý lặp qua mỗi rule và xử lý
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // Submit với JS 
                if (typeof options.onSubmit === 'function') {
                        var enableInputs = formElement.querySelectorAll('[name]:not([disable])')
                        var formValues = Array.from(enableInputs).reduce(function (values, input) {
                            switch (input.type) {
                                case 'radio':
                                    if (input.matches(':checked')) {
                                        values[input.name] = input.value;
                                    } 
                                    break;
                                case 'checkbox':
                                    if (!input.matches(":checked")) {
                                        values[input.name] = '';
                                        return values;
                                    }

                                    if (!Array.isArray(values[input.name])) {
                                        values[input.name] = [];
                                    } 
                                    values[input.name].push(input.value);
                                    break;
                                case 'file':
                                    values[input.name] = input.files;
                                    break;

                                default:
                                    values[input.name] = input.value;
                            }
                            return values;
                        }, {});
                        options.onSubmit(formValues)  
                } 
                //  Submit với hành vi mặc định 
                else {
                    formElement.submit();
                }
            } else {
                console.log('Yêu cầu nhập lại')
            }

        }

        options.rules.forEach(function (rule) {

            //  Lưu lại các rule cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
            var inputElement = formElement.querySelector(rule.selector)
            var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
            
            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function (inputElement) {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }

                // Xử lý trường hợp mỗi khi người dùng nhập text
                inputElement.oninput = function () {
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            });
  
        }) 
    }
}

Validator.isRequired = function (selector, customMessage) {
    return {
        selector: selector, 
        test: function (value) {
            return value ? undefined : customMessage || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector, customMessage) {
    return {
        selector: selector, 
        test: function (value) {
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
            return regex.test(value) ? undefined : customMessage || 'Trường này phải là email'
        }
    }
}

Validator.minLength = function (selector, min, customMessage) {
    return {
        selector: selector, 
        test: function (value) {
            return value.length >= min ? undefined : customMessage || `Vui lòng nhập tối thiểu ${min} Ký tự`
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, customMessage) {
    return {
        selector: selector, 
        test: function (value) {
          return value === getConfirmValue() ? undefined : customMessage || 'Giá trị nhập vào không chính xác'
        }
    }
}
