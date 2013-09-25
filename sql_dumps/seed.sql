INSERT INTO `pinup`.`accounts`
(`id`,
`strGUID`,
`strEmail`,
`strFullName`,
`strPassword512`,
`strSalt`,
`bStatus`,
`bEmailVerified`)
VALUES
(1,
'50c9e5e4-2412-11e3-a19b-b870f4968169',
'demo@mail.com',
'Adam Smith',
'c693ec851e6c24393dd338ce6c0bb33eaad8416462e09132c7d3373b5442a0415235ba5c59820bc8dc4d48db8829c250b3d33ceb69be8225bf7bec652940c462',
'pnrC%ezQ',
1,
1);

INSERT INTO `pinup`.`sites`
(`id`,
`strGUID`,
`strSiteName`,
`strURL`,
`bVerified`)
VALUES
(1,
'b7b7f57e-4961-11e2-b001-000c29e620fe',
'jbull',
'local.jbull.ca',
1);

INSERT INTO `pinup`.`accountssites`
(`id`,
`strGUID`,
`nAccountsID`,
`nSitesID`,
`bVerified`)
VALUES
(1,
'50cbe1b6-2412-11e3-a19b-b870f4968169',
1,
1,
1);

