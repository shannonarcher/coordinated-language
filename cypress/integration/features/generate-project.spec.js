context('Generate Project Name', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
    });

    it('should should have buttons that allow user perform actions', () => {
        cy.contains('↩︎');
    });
    
    it('should generate a project name on load', () => {
        
    });

    it('should list previous generations', () => {
        cy.reload()
            .reload()
            .reload()
            .get('[data-qa="generation-list"] li')
            .each((li) => {
                expect(li.text()).to.match(/[a-z]+-[a-z]+/i);
            });
    });

    it('should list a maximum of 10 generations', () => {
        for (let i = 0; i < 12; i++) {
            cy.reload();
        }

        cy.get('[data-qa="generation-list"] li')
            .its('length')
            .should('eq', 10);
    });
});