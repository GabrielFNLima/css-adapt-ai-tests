const { validate } = require('csstree-validator');
const cssValid = `.header{background-color:#333;color:#fff;padding:10px 20px}.logo{font-size:24px;font-weight:bold}.navbar{list-style-type:none;margin-top:10px}.navbar li{display:inline-block;margin-right:10px}.navbar li a{color:#fff;text-decoration:none}`,
  cssNotValid = ".header{}",
  apiResponseValidCss = ".header{background-color:#333;color:#fff;padding:5px 10px}.logo{font-size:14px;font-weight:bold}.navbar{list-style-type:none;margin-top:5px}.navbar li{display:block;margin-bottom:5px}.navbar li a{color:#fff;text-decoration:none}";

describe('Toggle between dark and light theme', () => {
  after(() => {
    cy.clearAllLocalStorage()
  })

  it('visit the application', () => {
    cy.visit('/')
  });

  describe('Verify if the application can toggle to the dark theme.', () => {
    it('click on the theme toggle button', () => {
      cy.get('[data-cy="ToggleTheme-button"]').trigger("click").click();
    });

    it('check if the sun icon exists, indicating the dark theme is active', () => {
      cy.get('[data-cy="ToggleTheme-button"]').find('[data-cy="ToggleTheme-iconSun"]').should('exist')
    });
  });

  describe('Verify if the application can toggle to the light theme.', () => {
    it('check if the sun icon exists, indicating the dark theme is active', () => {
      cy.get('[data-cy="ToggleTheme-button"]').find('[data-cy="ToggleTheme-iconSun"]').should('exist')
    });

    it('click on the theme toggle button', () => {
      cy.get('[data-cy="ToggleTheme-button"]').trigger("click");
    });

    it('check if the moon icon exists, indicating the light theme is active', () => {
      cy.get('[data-cy="ToggleTheme-button"]').find('[data-cy="ToggleTheme-iconMoon"]').should('exist')
    });
  });
});

describe('Responsive css code', () => {
  after(() => {
    cy.clearAllLocalStorage()
  })

  describe('Convert a valid css code to responsive target', () => {
    it('visit the application', () => {
      cy.visit('/')
    });

    it('enter a valid css code', () => {
      cy.get('[data-cy="MainPage-inputCode"]').type(cssValid, {
        parseSpecialCharSequences: false,
      });
    });

    it('enter "1440px" at current width', () => {
      cy.get('[data-cy="MainPage-inputCurrentWidth"]').type("1440px");
    });

    it('enter "769px" at taret width', () => {
      cy.get('[data-cy="MainPage-inputTargetWidth"]').type("769px");
    });

    it('submit the form', () => {
      cy.intercept('POST', '/api/adapt-css', (req) => {
        req.reply(apiResponseValidCss);
      }).as('convertValidCss');
      cy.get('[data-cy="MainPage-form"]').submit()
    });

    it('check if the success toast message appears.', () => {
      cy.get('body').find('[data-cy="CopyToClipboard-toastSuccess"]').should("exist")
    });

    it('validate the result CSS code, expecting no errors.', () => {
      cy.get('[data-cy="MainPage-result"]').invoke('val').then(val => {
        const errors = validate(val)
        expect(errors).to.be.empty;
      })
    });
  });

  describe('Convert a invalid css code to responsive target', () => {
    it('visit the application', () => {
      cy.visit('/')
    });

    it('enter a invalid css code', () => {
      cy.get('[data-cy="MainPage-inputCode"]').type(cssNotValid, {
        parseSpecialCharSequences: false,
      });
    });

    it('enter "1440px" at current width', () => {
      cy.get('[data-cy="MainPage-inputCurrentWidth"]').type("1440px");
    });

    it('enter "769px" at taret width', () => {
      cy.get('[data-cy="MainPage-inputTargetWidth"]').type("769px");
    });

    it('submit the form', () => {
      cy.intercept('POST', '/api/adapt-css', (req) => {
        req.reply(`Não é possível converter.`);
      }).as('convertInvalidCss');
      cy.get('[data-cy="MainPage-form"]').submit()
    });

    it('check if the copy to clipboard toast message appears.', () => {
      cy.get('body').find('[data-cy="CopyToClipboard-toastSuccess"]').should("exist")
    });

    it('validate the result CSS code, expecting errors.', () => {
      cy.get('[data-cy="MainPage-result"]').invoke('val').then(val => {
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

  describe('verify if the input current width is invalid', () => {
    it('visit the application', () => {
      cy.visit('/')
    });

    it('enter the css code', () => {
      cy.get('[data-cy="MainPage-inputCode"]').type(cssValid, {
        parseSpecialCharSequences: false,
      });
    });

    it('enter "1440" at current width', () => {
      cy.get('[data-cy="MainPage-inputCurrentWidth"]').type("1440");
    });

    it('enter "769px" at target width', () => {
      cy.get('[data-cy="MainPage-inputTargetWidth"]').type("769px");
    });

    it('submit form', () => {
      cy.get('[data-cy="MainPage-form"]').submit()
    });

    it('verify the error tost has the "1440 is invalid width."', () => {
      cy.get('[data-cy="Toast-invalidCurrentWidth"]').should(
        "have.text", "1440 is invalid width.");
    });
  });

  describe('verify if the input target width is invalid', () => {
    it('visit the application', () => {
      cy.visit('/')
    });

    it('enter the css code', () => {
      cy.get('[data-cy="MainPage-inputCode"]').type(cssValid, {
        parseSpecialCharSequences: false,
      });
    });

    it('enter "1440px" at current width', () => {
      cy.get('[data-cy="MainPage-inputCurrentWidth"]').type("1440px");
    });

    it('enter "769" at target width', () => {
      cy.get('[data-cy="MainPage-inputTargetWidth"]').type("769");
    });

    it('submit form', () => {
      cy.get('[data-cy="MainPage-form"]').submit()
    });

    it('verify the error tost has the message "1440 is invalid width."', () => {
      cy.get('[data-cy="Toast-invalidTargetWidth"]').should(
        "have.text", "769 is invalid width.");
    });
  });

  describe('Verify if the inputs are empty and show toast error', () => {
    describe('validate input "current width"', () => {
      it('visit the application', () => {
        cy.visit('/')
      });

      it('check if current width input is empty', () => {
        cy.get('[data-cy="MainPage-inputCurrentWidth"]').should("have.value", "")
      });

      it('submit form', () => {
        cy.get('[data-cy="MainPage-submit"]').click()
      });

      it('check if the error toast has the message "Current width is require."', () => {
        cy.get('[data-cy="Toast-currentWidthIsRequired"]').should("have.text", "Current width is require.")
      });
    });

    describe('validate input "target width"', () => {
      it('visit the application', () => {
        cy.visit('/')
      });

      it('enter "1440px" at current width', () => {
        cy.get('[data-cy="MainPage-inputCurrentWidth"]').type("1440px");
      });

      it('check if target width input is empty', () => {
        cy.get('[data-cy="MainPage-inputTargetWidth"]').should("have.value", "")
      });

      it('submit form', () => {
        cy.get('[data-cy="MainPage-submit"]').click()
      });

      it('check if the error toast has the message "Target width is require."', () => {
        cy.get('[data-cy="Toast-targetWidthIsRequired"]').should("have.text", "Target width is require.")
      });
    });

    describe('validate input "css Code"', () => {
      it('visit the application', () => {
        cy.visit('/')
      });

      it('enter "1440px" at input "current width"', () => {
        cy.get('[data-cy="MainPage-inputCurrentWidth"]').type("1440px");
      });

      it('enter "769px" at input "target width"', () => {
        cy.get('[data-cy="MainPage-inputTargetWidth"]').type("769px");
      });

      it('check if input code is empty', () => {
        cy.get('[data-cy="MainPage-inputCode"]').should("have.value", "")
      });

      it('submit form', () => {
        cy.get('[data-cy="MainPage-submit"]').click()
      });

      it('check if the error toast has the message "CSS code is require."', () => {
        cy.get('[data-cy="Toast-cssCodeMissing"]').should("have.text", "CSS code is require.")
      });
    });
  });
});

describe('validate "copy to clipboard" button', () => {
  after(() => {
    cy.clearAllLocalStorage()
  })

  it('visit the application', () => {
    cy.visit('/')
  });

  it('enter the css code', () => {
    cy.get('[data-cy="MainPage-inputCode"]').type(cssValid, {
      parseSpecialCharSequences: false,
    });
  });

  it('enter "1440px" at input "current width"', () => {
    cy.get('[data-cy="MainPage-inputCurrentWidth"]').type("1440px");
  });

  it('enter "769px" at input "target width"', () => {
    cy.get('[data-cy="MainPage-inputTargetWidth"]').type("769px");
  });

  it('submit the form', () => {
    cy.intercept('POST', '/api/adapt-css', (req) => {
      req.reply(apiResponseValidCss);
    }).as('cssClipBoard');
    cy.get('[data-cy="MainPage-form"]').submit()
  });

  it('click "copy to clipboard" button', () => {
    cy.get('[data-cy="CopyToClipboard-button"]').click()
  });

  it('check if the toast has the message "Copy to clipboard"', () => {
    cy.get('[data-cy="CopyToClipboard-toastSuccess"]').should("have.text", "Copy to clipboard")
  });

  it('check if the response text from api is the same in the clipboard', () => {
    cy.get('[data-cy="CopyToClipboard-button"]').focus();
    cy.assertValueCopiedToClipboard(apiResponseValidCss)
  });
});
