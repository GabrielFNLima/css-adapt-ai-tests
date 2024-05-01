const { validate } = require('csstree-validator');

class Form {
  elements = {
    toggleThemeButton: () => cy.get('[data-cy="ToggleTheme-button"]'),
    iconSun: () => cy.get('[data-cy="ToggleTheme-iconSun"]'),
    iconMoon: () => cy.get('[data-cy="ToggleTheme-iconMoon"]'),
    inputCode: () => cy.get('[data-cy="MainPage-inputCode"]'),
    inputCurrentWidth: () => cy.get('[data-cy="MainPage-inputCurrentWidth"]'),
    inputTargetWidth: () => cy.get('[data-cy="MainPage-inputTargetWidth"]'),
    submitButton: () => cy.get('[data-cy="MainPage-submit"]'),
    form: () => cy.get('[data-cy="MainPage-form"]'),
    result: () => cy.get('[data-cy="MainPage-result"]'),
    copyToClipboardButton: () => cy.get('[data-cy="CopyToClipboard-button"]'),   
  }
  submit() {
    this.elements.form().submit();
  }
  toggleTheme() {
    this.elements.toggleThemeButton().trigger('click').click();
  }
  enterCssCode(css) {
    this.elements.inputCode().clear().type(css, {
      parseSpecialCharSequences: false,
    });
  }
  pasteCssCode(css) {
    this.elements.inputCode().invoke('val', css).trigger('paste', {
      parseSpecialCharSequences: false,
    });
  }
  enterCurrentWidth(width) {
    this.elements.inputCurrentWidth().clear().type(width);
  }
  enterTargetWidth(width) {
    this.elements.inputTargetWidth().clear().type(width);
  }
}

class Toasts {
  elements = {
    toastSuccess: () => cy.get('[data-cy="CopyToClipboard-toastSuccess"]'),
    toastInvalidCurrentWidth: () => cy.get('[data-cy="Toast-invalidCurrentWidth"]'),
    toastInvalidTargetWidth: () => cy.get('[data-cy="Toast-invalidTargetWidth"]'),
    toastCurrentWidthIsRequired: () => cy.get('[data-cy="Toast-currentWidthIsRequired"]'),
    toastTargetWidthIsRequired: () => cy.get('[data-cy="Toast-targetWidthIsRequired"]'),
    toastCssCodeMissing: () => cy.get('[data-cy="Toast-cssCodeMissing"]'),
  }
  toastInvalidCurrentWidthShouldHave(have = "have.text", text) {
    this.elements.toastInvalidCurrentWidth().should(
      have, text);
  }
  toastInvalidTargetWidthShouldHave(have = "have.text", text) {
    this.elements.toastInvalidTargetWidth().should(
      have, text);
  }
  toastCurrentWidthIsRequiredShouldHave(have = "have.text", text) {
    this.elements.toastCurrentWidthIsRequired().should(
      have, text);
  }
  toastTargetWidthIsRequiredShouldHave(have = "have.text", text) {
    this.elements.toastTargetWidthIsRequired().should(
      have, text);
  }
  toastCssCodeMissingShouldHave(have = "have.text", text) {
    this.elements.toastCssCodeMissing().should(
      have, text);
  }
  toastSuccessCopyToClipboardShouldHave(have = "have.text", text) {
    this.elements.toastSuccess().should(
      have, text);
  }
  toastSuccessShouldExist() {
    this.elements.toastSuccess().should("exist")
  }
}

const setDataFixture = function (self) {
  cy.fixture('data').then((data) => {
    self.data = data
  })
}

const form = new Form();
const toasts = new Toasts();

describe('Toggle between dark and light theme', () => {
  after(() => {
    cy.clearAllLocalStorage()
  })

  it('visit the application', () => {
    cy.visit('/')
  });

  describe('Verify if the application can toggle to the dark theme.', () => {
    it('click on the theme toggle button', () => {
      form.toggleTheme();
    });

    it('check if the sun icon exists, indicating the dark theme is active', () => {
      form.elements.toggleThemeButton().find('[data-cy="ToggleTheme-iconSun"]').should('exist')
    });
  });

  describe('Verify if the application can toggle to the light theme.', () => {
    it('check if the sun icon exists, indicating the dark theme is active', () => {
      form.elements.toggleThemeButton().find('[data-cy="ToggleTheme-iconSun"]').should('exist')
    });

    it('click on the theme toggle button', () => {
      form.elements.toggleThemeButton().click()
    });

    it('check if the moon icon exists, indicating the light theme is active', () => {
      form.elements.toggleThemeButton().find('[data-cy="ToggleTheme-iconMoon"]').should('exist')
    });
  });
});

describe('Responsive css code', () => {
  after(() => {
    cy.clearAllLocalStorage()
  })
  beforeEach(function () {
    setDataFixture(this)
  })
  
  describe('Convert a valid css code to responsive target', () => {
    it('visit the application', () => {
      cy.visit('/')
    });

    it('enter a valid css code', function() {
      form.enterCssCode(this.data.cssValid)
    });

    it('enter "1440px" at current width', () => {
      form.enterCurrentWidth("1440px")
    });

    it('enter "769px" at taret width', () => {
      form.enterTargetWidth("769px")
    });

    it('submit the form', () => {
      cy.fixture('response').then((response) => {
        cy.intercept('POST', '/api/adapt-css', response.responseValidCss).as('convertValidCss')
      })
      form.submit()
      cy.wait("@convertValidCss")
    });

    it('check if the success toast message appears.', () => {
      toasts.toastSuccessShouldExist();
    });

    it('validate the result CSS code, expecting no errors.', () => {
      form.elements.result().invoke('val').then(val => {
        const errors = validate(val)
        expect(errors).to.be.empty;
      })
    });
  });

  describe('Convert a invalid css code to responsive target', () => {
    it('visit the application', () => {
      cy.visit('/')
    });

    it('enter a invalid css code', function() {
      form.enterCssCode(this.data.cssValid)
    });

    it('enter "1440px" at current width', () => {
      form.enterCurrentWidth("1440px");
    });

    it('enter "769px" at taret width', () => {
      form.enterTargetWidth("769px");
    });

    it('submit the form', () => {
      // cy.intercept('POST', '/api/adapt-css', (req) => {
      //   req.reply(`Não é possível converter.`);
      // }).as('convertInvalidCss');
      cy.fixture('response').then((response) => {
        cy.intercept('POST', '/api/adapt-css', response.responseInvalidCss).as('convertInvalidCss')
      })
      form.submit();
      cy.wait("@convertInvalidCss")
    });

    it('check if the copy to clipboard toast message appears.', () => {
      toasts.toastSuccessShouldExist();
    });

    it('validate the result CSS code, expecting errors.', () => {
      form.elements.result().invoke('val').then(val => {
        const errors = validate(val);
        expect(errors).not.to.be.empty;
      })
    });
  });
});

describe('Validantion all inputs', () => {
  after(() => {
    cy.clearAllLocalStorage()
  })
  beforeEach(function () {
    setDataFixture(this)
  })

  describe('verify if the input current width is invalid', () => {
    it('visit the application', () => {
      cy.visit('/')
    });

    it('enter the css code', function() {
      form.enterCssCode(this.data.cssValid)
    });

    it('enter "1440" at current width', () => {
      form.enterCurrentWidth("1440");
    });

    it('enter "769px" at target width', () => {
      form.enterTargetWidth("769px");
    });

    it('submit form', () => {
      form.submit()
    });

    it('verify the error tost has the "1440 is invalid width."', () => {
      toasts.toastInvalidCurrentWidthShouldHave(
        "have.text", "1440 is invalid width.");
    });
  });

  describe('verify if the input target width is invalid', () => {
    it('visit the application', () => {
      cy.visit('/')
    });

    it('enter the css code', function() {
      form.enterCssCode(this.data.cssValid)
    });

    it('enter "1440px" at current width', () => {
      form.enterCurrentWidth("1440px");
    });

    it('enter "769" at target width', () => {
      form.enterTargetWidth("769");
    });

    it('submit form', () => {
      form.submit()
    });

    it('verify the error tost has the message "1440 is invalid width."', () => {
      toasts.toastInvalidTargetWidthShouldHave(
        "have.text", "769 is invalid width.");
    });
  });

  describe('Verify if the inputs are empty and show toast error', () => {
    describe('validate input "current width"', () => {
      it('visit the application', () => {
        cy.visit('/')
      });

      it('check if current width input is empty', () => {
        form.elements.inputCurrentWidth().should("have.value", "")
      });

      it('submit form', () => {
        form.elements.submitButton().click()
      });

      it('check if the error toast has the message "Current width is require."', () => {
        toasts.toastCurrentWidthIsRequiredShouldHave("have.text", "Current width is require.")
      });
    });

    describe('validate input "target width"', () => {
      it('visit the application', () => {
        cy.visit('/')
      });

      it('enter "1440px" at current width', () => {
        form.enterCurrentWidth("1440px");
      });

      it('check if target width input is empty', () => {
        form.elements.inputTargetWidth().should("have.value", "")
      });

      it('submit form', () => {
        form.elements.submitButton().click()
      });

      it('check if the error toast has the message "Target width is require."', () => {
        toasts.toastTargetWidthIsRequiredShouldHave("have.text", "Target width is require.")
      });
    });

    describe('validate input "css Code"', () => {
      it('visit the application', () => {
        cy.visit('/')
      });

      it('enter "1440px" at input "current width"', () => {
        form.enterCurrentWidth("1440px");
      });

      it('enter "769px" at input "target width"', () => {
        form.enterTargetWidth("769px");
      });

      it('check if input code is empty', () => {
        form.elements.inputCode().should("have.value", "")
      });

      it('submit form', () => {
        form.elements.submitButton().click()
      });

      it('check if the error toast has the message "CSS code is require."', () => {
        toasts.toastCssCodeMissingShouldHave("have.text", "CSS code is require.")
      });
    });
  });
});

describe('validate "copy to clipboard" button', () => {
  after(() => {
    cy.clearAllLocalStorage()
  })
  beforeEach(function () {
    setDataFixture(this)
    cy.fixture('response').then((response) => {
      this.response = response
    })
  })

  it('visit the application', () => {
    cy.visit('/')
  });

  it('enter the css code', function() {
    form.enterCssCode(this.data.cssValid)
  });

  it('enter "1440px" at input "current width"', () => {
    form.enterCurrentWidth("1440px");
  });

  it('enter "769px" at input "target width"', () => {
    form.enterTargetWidth("769px");
  });

  it('submit the form', () => {
    cy.fixture('response').then((response) => {
      cy.intercept('POST', '/api/adapt-css', response.responseValidCss).as('cssClipBoard')
    })
    form.submit()
  });

  it('click "copy to clipboard" button', () => {
    form.elements.copyToClipboardButton().click()
  });

  it('check if the toast has the message "Copy to clipboard"', () => {
    toasts.toastSuccessCopyToClipboardShouldHave("have.text", "Copy to clipboard")
  });

  it('check if the response text from api is the same in the clipboard', function () {
    form.elements.copyToClipboardButton().focus();
    cy.assertValueCopiedToClipboard(this.response.responseValidCss)
  });
});
