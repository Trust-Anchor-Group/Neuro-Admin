export default class ResponseModel {
    constructor(statusCode = 404, message = '', data = null) {
        this.success = false;
        this.statusCode = statusCode;
        this.message = message;

        if (statusCode >= 200 && statusCode <= 299) this.success = true;

        if(data){
            if(Array.isArray(data)) {
                this.items = data.length;
            } else {
                this.items = 1;
            }
        } else {
            this.items = 0;
        }

        this.data = data;
    }
}