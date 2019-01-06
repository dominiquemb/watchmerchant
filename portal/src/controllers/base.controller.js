class BaseController {
    constructor(app) {
        this.app = app;
        if (this.route && typeof this.route === 'function') {
            this.route();
        }
    }

    route() {}

    render(request, response) {
        if (request.params.api || !this.renderHtml) {
            const responseData = {};
            if (request.data) responseData.data = request.data;
            if (request.params.page) responseData.page = request.params.page;
            if (request.totalPages) responseData.totalPages = request.totalPages;
            return response.status(200).send(responseData);
        } else {
            this.renderHtml(request, response);
        }
    }
}

module.exports = BaseController;
