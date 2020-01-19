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
        try {
            let {subdomain, amoEmail, key} = req.body;
            req.session.user.subdomain = subdomain;
            req.session.user.amoEmail = amoEmail;
            req.session.user.key = key
            // console.log(req.session.user)
            let requestOptionsFirstAuth = {
                method: 'POST',
                redirect: 'follow',
            };
            let cookie;
            let responseWithCookie = await fetch(`https://${subdomain}.amocrm.ru/private/api/auth.php?USER_LOGIN=${amoEmail}&USER_HASH=${key}&type=json`, requestOptionsFirstAuth)
                .then(response => {
                    cookie = response.headers.raw()['set-cookie'];
                });

            let response = true;
            res.json({
                response: response,

            });
            res.render()
        } catch (error) {
            let response = false;
            res.json({
                response: response
            })
        }
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
    .route('/dashboard/authorized')
.get(async (req,res)=>{
    if (req.session.user) {
        let userData = req.session.user;
        let subdomain = req.session.user.subdomain;
        let amoEmail = req.session.user.amoEmail;
        let key = req.session.user.key;

        let requestOptionsFirstAuth = {
            method: 'POST',
            redirect: 'follow',
        };
        let cookie;
        let responseWithCookie = await fetch(`https://${subdomain}.amocrm.ru/private/api/auth.php?USER_LOGIN=${amoEmail}&USER_HASH=${key}&type=json`, requestOptionsFirstAuth)
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
        let correctData = dataFromAmo._embedded.items







        res.render('allleads', {
            correctData,
            userData
        })
    } else res.redirect('/login')
})


router
    .route('/leadscs')
    .get((req,res)=>{
        if (req.session.user) {
            let userData = req.session.user
            res.render('leadscs', {
                userData
            })
        } else res.redirect('/login')
    })
    .post(async(req,res)=>{
       let pipelineId = req.body.pipelineId;
        let data = await Lead.find({pipeline_id:pipelineId});

        // let contactsIdArray = data.map((elem)=>{
        //     let newElem=elem.main_contact.id;
        //     elem=newElem;
        //     return elem
        // })
        // let newArr = contactsIdArray
        //
        //
        //
        // console.log(contactsIdArray.split(','));


        // let subdomain = req.session.user.subdomain;
        // let amoEmail = req.session.user.amoEmail;
        // let key = req.session.user.key;
        //
        // let requestOptionsFirstAuth = {
        //     method: 'POST',
        //     redirect: 'follow',
        // };
        // let cookie;
        // let responseWithCookie = await fetch(`https://${subdomain}.amocrm.ru/private/api/auth.php?USER_LOGIN=${amoEmail}&USER_HASH=${key}&type=json`, requestOptionsFirstAuth)
        //     .then(response => {
        //         cookie = response.headers.raw()['set-cookie'];
        //     });
        // let requestOptionsAuthorized = {
        //     method: 'GET',
        //     redirect: 'follow',
        //     headers: {
        //         'Cookie': cookie[0]
        //     }
        // };
        // let responseWithData = await fetch("https://prjctamoelbrus.amocrm.ru/api/v2/leads", requestOptionsAuthorized);
        // let dataFromAmo = await responseWithData.json();
        // console.log(dataFromAmo);
        // let correctData = dataFromAmo._embedded.items





       res.render('allleadscs',{
            data: data
        })



    });



router
    .route('/hook')
    .get((req,res)=>{
    console.log(req.body);
        res.end()
})
    .post(async(req,res)=>{
        let leadId = req.body.leads.status[0].id;

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
        let readyToSave = dataFromAmo._embedded.items[0];
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









router.get('/mail/:id', async (req, res)=>{
    //first auth
    // console.log(req.params.id)
    let requestOptionsFirstAuth = {
        method: 'POST',
        redirect: 'follow',
    };
    let cookie = [];
    let login = 'prjctamoelbrus@yandex.com';
    let hash = '935841b1d8108cd949645a6c754cd06840ed40eb';
    let responseWithCookie = await fetch(`https://secondelbrus.amocrm.ru/private/api/auth.php?USER_LOGIN=${login}&USER_HASH=${hash}type=json`, requestOptionsFirstAuth)
        .then(response => {
            cookie = response.headers.raw()['set-cookie'];
            // console.log(cookie);
            console.log(response)
        });
    //request authorized
    // console.log(typeof cookie[0])
    // let raw = await JSON.stringify({"add":[{"element_id":"2820677","element_type":"2","complete_till":"1579440120","task_type":"1","text":"PEREZVONITE"}]});
    // // console.log(raw);
    // let requestOptionsAuthorized = {
    //     method: 'POST',
    //     redirect: 'follow',
    //     headers: {
    //         "Content-Type": "application/json",
    //         "Cookie": cookie[0],
    //     },
    //     body: raw
    // }
    // let responseWithData = await fetch(`https://secondelbrus.amocrm.ru/api/v2/tasks`, requestOptionsAuthorized);
    // let dataFromAmo = await responseWithData.json();
    // console.log(dataFromAmo);



    //new post request

    // var myHeaders = new Headers();
    // myHeaders.append("Content-Type", "application/json");
    // myHeaders.append("User-Agent", "PostmanRuntime/7.22.0");
    // myHeaders.append("Accept", "*/*");
    // myHeaders.append("Cache-Control", "no-cache");
    // // myHeaders.append("Postman-Token", "7e16f68c-7118-4549-8b0c-e84d87ae17d3");
    // myHeaders.append("Host", "secondelbrus.amocrm.ru");
    // myHeaders.append("Accept-Encoding", "gzip, deflate, br");
    // myHeaders.append("Content-Length", "233");
    // myHeaders.append("Cookie", `${cookie[0]}`);
    // myHeaders.append("Connection", "keep-alive");

    // let raw = JSON.stringify({"add":[{"element_id":"2820677","element_type":"2","complete_till":"1579440120","task_type":"1","text":"from back"}]});
    //
    // let requestOptions = {
    //     method: 'POST',
    //     headers: {
    //         "Content-Type":"application/json",
    //         "Host": "secondelbrus.amocrm.ru",
    //         "Accept-Encoding":"gzip, deflate, br",
    //         "Cookie": cookie[0],
    //         "Connection":"keep-alive"
    //
    //     },
    //     body: raw,
    //     redirect: 'follow'
    // };
    //
    // fetch("https://secondelbrus.amocrm.ru/api/v2/tasks", requestOptions)
    //     .then(response => response.text())
    //     .then(result => console.log(result))
    //     .catch(error => console.log('error', error));

    // let requestOptionsAuthorized = {
    //     method: 'GET',
    //     headers: {
    //         'Cookie': cookie[0]
    //     }
    // };
    // let responseWithData = await fetch(`https://secondelbrus.amocrm.ru/api/v2/leads?id=2820677`, requestOptionsAuthorized);
    // let dataFromAmo = await responseWithData.json();
    // console.log(dataFromAmo);


    res.end()

})

module.exports = router;
