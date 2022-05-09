function Validator(options) {

    const formElement = document.querySelector(options.form);
    var selectorRules = {};

    function getParentNode(element, selector) {
        while (element.parentNode) {
            if (element.parentNode.matches(selector)) {
                return element.parentNode;
            }
            element = element.parentNode;
        }
    }

    function validate(inputElement, rule) {
        let errorMessage;
        const errorElement = getParentNode(inputElement, options.formGroupSelector).querySelector(options.errorElement);
        let checkValid = true;
        let rules = selectorRules[rule.selector];

        for (var i = 0; i < selectorRules[rule.selector].length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            checkValid = false;
            errorElement.innerText = errorMessage;
            getParentNode(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            checkValid = true;
            errorElement.innerText = '';
            getParentNode(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return checkValid;
    }

    if (formElement) {

        // Xử lý submit form - cần validate toàn bộ 
        formElement.onsubmit = function(e) {
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(rule => {
                const inputElement = formElement.querySelector(rule.selector);
                let valid = validate(inputElement, rule);
                if (!valid) {
                    isFormValid = false;
                }
            })

            if (isFormValid) {
                const nodeListInput = formElement.querySelectorAll('[name]');
                const arrayInput = Array.from(nodeListInput);
                const result = {};

                arrayInput.forEach(function(input) {
                    switch (input.type) {
                        case 'radio':
                            result[input.name] = formElement.querySelector('input[name="' + input.name + '"]' + ':checked').value;
                            break;
                        case 'checkbox':
                            if (!input.matches(':checked')) {
                                break;
                            }
                            if (!Array.isArray(result[input.name])) {
                                result[input.name] = [];
                            }
                            result[input.name].push(input.value);
                            break;
                        default:
                            result[input.name] = input.value;
                    }
                })
                options.onSubmit(result);
            } else {
                console.log("Error Form");
            }
        }

        //Lặp qua các rule và thêm vào mảng rule của từng selector
        options.rules.forEach(rule => {

            //Lưu lại các rule cho các input khác nhau
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            const inputElements = formElement.querySelectorAll(rule.selector);

            if (inputElements) {
                Array.from(inputElements).forEach(function(inputElement) {
                    inputElement.onblur = function() {
                        //lặp assign - Lấy lần gán cuối cùng - rule chỉ để lấy selector , hàm test lấy trên object
                        validate(inputElement, rule);
                    }
                    inputElement.oninput = function() {
                        const errorElement = getParentNode(inputElement, options.formGroupSelector).querySelector(options.errorElement);
                        errorElement.innerText = '';
                        getParentNode(inputElement, options.formGroupSelector).classList.remove('invalid');
                    }
                })
            }
        })
    } else {
        console.log('Not find form element');
    }
}

Validator.isRequired = (selector, message) => {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    }
}

Validator.isEmail = (selector, message) => {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email';
        }
    }
}

Validator.minLength = (selector, minLength) => {
    return {
        selector: selector,
        test: function(value) {
            return (value.length >= minLength) ? undefined : ` Vui lòng nhập password tối thiểu ${minLength} ký tự `;
        }
    }
}

Validator.isConfirmEqual = (selector, getConfirmValue, message) => {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Vui lòng nhập đúng mật khẩu'
        }
    }
}


Validator.isPhoneNumber = (selector, message) => {
    return {
        selector: selector,
        test: function(value) {
            var phoneTest = /^[0-9-+]+$/;
            return phoneTest.test(value) ? undefined : message || 'Nhập lại số điện thoại';
        }
    }
}