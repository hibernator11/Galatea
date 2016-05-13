'use strict';

describe('Publications E2E Tests:', function () {
  describe('Test booklists page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/publications');
      expect(element.all(by.repeater('publication in publications')).count()).toEqual(0);
    });
  });
});
