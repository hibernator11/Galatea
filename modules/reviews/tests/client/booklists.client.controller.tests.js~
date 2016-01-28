'use strict';

(function () {
  // Booklists Controller Spec
  describe('Booklists Controller Tests', function () {
    // Initialize global variables
    var BooklistsController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Booklists,
      mockBooklist;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Booklists_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Booklists = _Booklists_;

      // create mock booklist
      mockBooklist = new Booklists({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'A Booklist about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Booklists controller.
      BooklistsController = $controller('BooklistsController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one booklist object fetched from XHR', inject(function (Booklists) {
      // Create a sample books array that includes the new book
      var sampleBooklists = [mockBooklist];

      // Set GET response
      $httpBackend.expectGET('api/booklists').respond(sampleBooklists);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.booklists).toEqualData(sampleBooklists);
    }));

    it('$scope.findOne() should create an array with one booklist object fetched from XHR using a booklistId URL parameter', inject(function (Booklists) {
      // Set the URL parameter
      $stateParams.booklistId = mockBooklist._id;

      // Set GET response
      $httpBackend.expectGET(/api\/books\/([0-9a-fA-F]{24})$/).respond(mockBooklist);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.booklist).toEqualData(mockBooklist);
    }));

    describe('$scope.create()', function () {
      var sampleBooklistPostData;

      beforeEach(function () {
        // Create a sample book object
        sampleBooklistPostData = new Booklists({
          title: 'A Booklist about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'A Booklist about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (Booklists) {
        // Set POST response
        $httpBackend.expectPOST('api/booklists', sampleBooklistPostData).respond(mockBooklist);

        // Run controller functionality
        scope.create(true);
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the book was created
        expect($location.path.calls.mostRecent().args[0]).toBe('booklists/' + mockBooklist._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/booklists', sampleBooklistPostData).respond(400, {
          message: errorMessage
        });

        scope.create(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock booklist in scope
        scope.booklist = mockBooklist;
      });

      it('should update a valid booklist', inject(function (Booklists) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/booklists\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/booklists/' + mockBooklist._id);
      }));

      it('should set scope.error to error response message', inject(function (Booklists) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/booklists\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(booklist)', function () {
      beforeEach(function () {
        // Create new booklists array and include the booklist
        scope.booklists = [mockBooklist, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/booklists\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockBooklist);
      });

      it('should send a DELETE request with a valid booklistId and remove the book from the scope', inject(function (Booklists) {
        expect(scope.booklists.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.booklist = mockBooklist;

        $httpBackend.expectDELETE(/api\/booklists\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to booklists', function () {
        expect($location.path).toHaveBeenCalledWith('booklists');
      });
    });
  });
}());
