'use strict';

describe('Booklists E2E Tests:', function () {
  describe('Test booklists page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/booklists');
      expect(element.all(by.repeater('boolistk in booklists')).count()).toEqual(0);
    });
  });
});
