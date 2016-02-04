'use strict';

describe('Groups E2E Tests:', function () {
  describe('Test groups page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/groups');
      expect(element.all(by.repeater('group in groups')).count()).toEqual(0);
    });
  });
});
