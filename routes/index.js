const express = require("express");
const bcrypt = require("bcrypt");
const {sessionChecker} = require("../middleware/auth");
const User = require("../models/users");
const fetch = require('node-fetch');
const saltRounds = 10;
const router = express.Router();
const Lead = require("../models/leads");



router.get("/", sessionChecker, (req, res) => {
    res.redirect("/login");
});

router
    .route("/login")
    .get(sessionChecker, (req, res) => {
        res.render("login");
    })
    .post(async (req, res) => {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if (user && (await bcrypt.compare(password, user.password))) {
            req.session.user = user;
            res.redirect("/dashboard");
        } else {
            res.redirect("/login");
        }
    });

router
    .route("/signup")
    .get(sessionChecker, (req, res) => {
        res.render("signup");
    })
    .post(async (req, res, next) => {
        try {
            const {username, email, password} = req.body;
            const user = new User({
                username,
                email,
                password: await bcrypt.hash(password, saltRounds)
            });
            await user.save();
            req.session.user = user;
            res.redirect("/dashboard");
        } catch (error) {
            res.render('wrongsignup');
        }
    });

router.get("/logout", async (req, res, next) => {
    if (req.session.user) {
        try {
            await req.session.destroy();
            res.clearCookie("user_sid");
            res.redirect("/");
        } catch (error) {
            next(error);
        }
    } else {
        res.redirect("/login");
    }
});

router
    .route('/dashboard')
    .post(async (req, res) => {
        let requestOptionsFirstAuth = {
            method: 'POST',
            redirect: 'follow',
        };
        let cookie;
        let responseWithCookie = await fetch("https://prjctamoelbrus.amocrm.ru/private/api/auth.php?USER_LOGIN=prjctamoelbrus@yandex.com&USER_HASH=5e3c06165392209beb6dcdeb1216cf89ddac0844&type=json", requestOptionsFirstAuth)
            .then(response => {
                cookie = response.headers.raw()['set-cookie'];
            });
        let requestOptionsAuthorized = {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'Cookie': cookie[0]
            }
        };
        let responseWithData = await fetch("https://prjctamoelbrus.amocrm.ru/api/v2/leads", requestOptionsAuthorized);
        let dataFromAmo = await responseWithData.json();
        console.log(dataFromAmo._embedded);

        res.end()
    })
    .get((req,res)=>{
        if (req.session.user) {
            let userData = req.session.user;
            res.render('dashboard', {
                userData
            })
        } else res.redirect('/login')
    });

router
    .route('/hook')
    .get((req,res)=>{
    console.log(req.body)
        res.end()
})
    .post(async(req,res)=>{
        let leadId = req.body.leads.status[0].id

        let requestOptionsFirstAuth = {
            method: 'POST',
            redirect: 'follow',
        };
        let cookie;
        let responseWithCookie = await fetch("https://prjctamoelbrus.amocrm.ru/private/api/auth.php?USER_LOGIN=prjctamoelbrus@yandex.com&USER_HASH=5e3c06165392209beb6dcdeb1216cf89ddac0844&type=json", requestOptionsFirstAuth)
            .then(response => {
                cookie = response.headers.raw()['set-cookie'];
            });
        let requestOptionsAuthorized = {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'Cookie': cookie[0]
            }
        };
        let responseWithData = await fetch(`https://prjctamoelbrus.amocrm.ru/api/v2/leads?id=${leadId}`, requestOptionsAuthorized);
        let dataFromAmo = await responseWithData.json();
        let readyToSave = dataFromAmo._embedded.items[0]
        console.log(readyToSave.id);
        const lead = new Lead ({
            id: readyToSave.id,
            name: readyToSave.name,
            responsible_user_id: readyToSave.responsible_user_id,
            created_by: readyToSave.created_by,
            created_at: readyToSave.created_at,
            updated_at: readyToSave.updated_at,
            account_id: readyToSave.account_id,
            pipeline_id: readyToSave.pipeline_id,
            status_id: readyToSave.status_id,
            updated_by: readyToSave.updated_by,
            is_deleted: readyToSave.is_deleted,
            main_contact: readyToSave.main_contact,
            group_id: readyToSave.group_id,
            company: readyToSave.company,
            closed_at: readyToSave.closed_at,
            closest_task_at: readyToSave.closest_task_at,
            tags: readyToSave.tags,
            custom_fields:readyToSave.custom_fields,
            contacts: readyToSave.contacts,
            sale: readyToSave.sale,
            loss_reason_id: readyToSave.loss_reason_id,
            pipeline: readyToSave.pipeline,
            _links: readyToSave._links
        });
        await lead.save();




        console.log(dataFromAmo._embedded);
        console.log(leadId)
        res.end()
    });


module.exports = router;
