class APIFeatures {

    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
      //Filtering
      const queryObj = { ...this.queryString };
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach((el) => delete queryObj[el]);

      //Advanced filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );

      //const tours = await Tour.find();
      //console.log(this.query);
      this.query = this.query.find((JSON.parse(queryStr)));
      return this;
    }

    sorting() {
        //Sorting according to query params
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' '); 
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
         //Sending specific fields as results to the client
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    pagination() {
          //Implementing pagination
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        if (this.queryString.page || this.queryString.limit) {
            this.query = this.query.skip(skip).limit(limit);
        }
        return this;
    }
}

module.exports = APIFeatures;