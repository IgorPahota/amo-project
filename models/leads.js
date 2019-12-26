const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
    id: Number,
    name: String,
    responsible_user_id: Number,
    created_by: Number,
    created_at: Number,
    updated_at: Number,
    account_id: Number,
    pipeline_id: Number,
    status_id: Number,
    updated_by: Number,
    is_deleted: Boolean,
    main_contact: Object,
    group_id: Number,
    company: Object,
    closed_at: Number,
    closest_task_at: Number,
    tags: Object,
    custom_fields:Object,
    contacts: Object,
    sale: Number,
    loss_reason_id: Number,
    pipeline: Object,
    _links: Object

});

module.exports = mongoose.model('Lead', leadSchema);