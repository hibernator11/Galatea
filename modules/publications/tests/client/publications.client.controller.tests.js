'use strict';

(function () {
  // Publications Controller Spec
  describe('Publications Controller Tests', function () {
    // Initialize global variables
    var PublicationsController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Publications,
      mockPublication;

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
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Publications_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Publications = _Publications_;

      // create mock publication
      mockPublication = new Publications({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'A Publication about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Publications controller.
      PublicationsController = $controller('PublicationsController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one publication object fetched from XHR', inject(function (Publications) {
      // Create a sample books array that includes the new book
      var samplePublications = [mockPublication];

      // Set GET response
      $httpBackend.expectGET('api/publications').respond(samplePublications);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.publications).toEqualData(samplePublications);
    }));

    it('$scope.findOne() should create an array with one publication object fetched from XHR using a publicationId URL parameter', inject(function (Publications) {
      // Set the URL parameter
      $stateParams.publicationId = mockPublication._id;

      // Set GET response
      $httpBackend.expectGET(/api\/books\/([0-9a-fA-F]{24})$/).respond(mockPublication);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.publication).toEqualData(mockPublication);
    }));

    describe('$scope.create()', function () {
      var samplePublicationPostData;

      beforeEach(function () {
        // Create a sample book object
        samplePublicationPostData = new Publications({
          title: 'A Publication about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'A Publication about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (Publications) {
        // Set POST response
        $httpBackend.expectPOST('api/publications', samplePublicationPostData).respond(mockPublication);

        // Run controller functionality
        scope.create(true);
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the book was created
        expect($location.path.calls.mostRecent().args[0]).toBe('publications/' + mockPublication._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/publications', samplePublicationPostData).respond(400, {
          message: errorMessage
        });

        scope.create(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock publication in scope
        scope.publication = mockPublication;
      });

      it('should update a valid publication', inject(function (Publications) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/publications\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/publications/' + mockPublication._id);
      }));

      it('should set scope.error to error response message', inject(function (Publications) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/publications\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(publication)', function () {
      beforeEach(function () {
        // Create new publications array and include the publication
        scope.publications = [mockPublication, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/publications\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockPublication);
      });

      it('should send a DELETE request with a valid publicationId and remove the book from the scope', inject(function (Publications) {
        expect(scope.publications.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.publication = mockPublication;

        $httpBackend.expectDELETE(/api\/publications\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to publications', function () {
        expect($location.path).toHaveBeenCalledWith('publications');
      });
    });
  });
}());
