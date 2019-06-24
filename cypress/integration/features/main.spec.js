context('Generate Project Name', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');

        cy.get('[data-cy=adjective]').as('adj');
        cy.get('[data-cy=noun]').as('noun');
        cy.get('[data-cy=reload]').as('reload');
        
        cy.get('@reload').click();
        cy.get('@reload').click();
        cy.get('@reload').click();

        cy.get('[data-cy=generation-list] li').as('listItems');
    });

    it('should display a page with a generated project name', () => {
        // has a button to reload the page
        cy.contains('↩︎');
        
        // contains some sort of output for adj and noun
        cy.get('@adj')
            .contains(/[a-z]+/i);
        cy.get('@noun')
            .contains(/[a-z]+/i);
    });

    it('should list previous generations', () => {
        // it lists previous generations
        cy.get('@listItems')
            .each((li) => {
                expect(li.text()).to.match(/[a-z]+-[a-z]+/i);
            });

        // it displays no more than 10 previous generations
        for (let i = 0; i < 12; i++) {
            cy.get('@reload').click();
        }

        cy.get('@listItems')
            .its('length')
            .should('eq', 10);
    });

    describe('when toggling favourites', () => {
        it('toggles the generation as a favourite', () => {
            cy.get('[data-cy^=favourite-form]')
                .should('have.attr', 'data-cy')
                .then((cyId) => {
                    const id = cyId.replace('favourite-form-', '');
                    
                    cy.get(`[data-cy=favourite-form-${id}]`)
                        .submit()
                        .then(() => {
                            cy.get(`[data-cy=unfavourite-form-${id}]`)
                                .should('exist');

                            cy.get(`[data-cy=unfavourite-form-${id}]`)
                                .submit()
                                .then(() => {
                                    cy.get(`[data-cy=favourite-form-${id}]`)
                                        .should('exist');
                                });
                        });
                });
        });
    });

    describe('when toggling the locks for the adjective / noun', () => {
        it('locks / unlocks the adjectives for future generations', () => {
            cy.get('@adj')
                .submit();
                
            cy.get('@adj')
                .contains('🔒');

            cy.get('@reload').click();

            cy.get('@adj')
                .then(($adjective) => {
                    const text = $adjective.text().replace(/[^a-z]*/i, '');
                    cy.get('@listItems')
                        .first()
                        .contains(text);

                    cy.get('@adj')
                        .submit();
                        
                    cy.get('@adj')
                        .contains('🔓');

                    cy.get('@reload').click();

                    cy.get('@adj')
                        .should('not.contain', text);
                });
        });

        it('locks / unlocks the nouns for future generations', () => {
            cy.get('@noun')
                .submit();
                
            cy.get('@noun')
                .contains('🔒');

            cy.get('@reload').click();

            cy.get('@noun')
                .then(($noun) => {
                    const text = $noun.text().replace(/[^a-z]*/i, '');
                    cy.get('@listItems')
                        .first()
                        .contains(text);

                    cy.get('@noun')
                        .submit();
                        
                    cy.get('@noun')
                        .contains('🔓');

                    cy.get('@reload').click();

                    cy.get('@noun')
                        .should('not.contain', text);
                });
        });
    });

    describe('when there are max (10) generations', () => {
        beforeEach(() => {
            cy.get('[data-cy^=favourite-form]')
                .first()
                .submit();
            cy.get('[data-cy^=favourite-form]')
                .first()
                .submit();
            cy.get('[data-cy^=favourite-form]')
                .first()
                .submit();
            
            for (let i = 0; i < 11; i++) {
                cy.get('@reload').click();
            }
        });

        it('keeps the favourites at the bottom of the generations list', () => {
            cy.get('@listItems')
                .its('length')
                .should('eq', 13);

            cy.get('@listItems')
                .eq(10)
                .contains('👎');
        });

        it('deletes the entries if they are > 10th position and are unfavourited', () => {
            cy.get('[data-cy^=unfavourite-form]')
                .first()
                .submit();

            cy.get('@listItems')
                .its('length')
                .should('eq', 12);
        });
    });
});