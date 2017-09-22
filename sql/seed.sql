INSERT INTO `pinup`.`accounts`
(
	`id`,
	`strGUID`,
	`strEmail`,
	`strFullName`,
	`strPassword512`,
	`strSalt`,
	`bStatus`,
	`bEmailVerified`,
	`dateRegistered`
) VALUES (
	1,
	'50c9e5e4-2412-11e3-a19b-b870f4968169',
	'demo@mail.com',
	'Adam Smith',
	'c693ec851e6c24393dd338ce6c0bb33eaad8416462e09132c7d3373b5442a0415235ba5c59820bc8dc4d48db8829c250b3d33ceb69be8225bf7bec652940c462',
	'pnrC%ezQ',
	1,
	1,
	NOW()
);

INSERT INTO `pinup`.`sites`
(
	`id`,
	`strGUID`,
	`strSiteName`,
	`strURL`,
	`bVerified`
) VALUES (
	1,
	'b7b7f57e-4961-11e2-b001-000c29e620fe',
	'pinup',
	'pinup.dev',
	1
);

INSERT INTO `pinup`.`sites`
(
	`id`,
	`strGUID`,
	`strSiteName`,
	`strURL`,
	`bVerified`
) VALUES (
	2,
	'39f2364f-6835-4c20-bf73-321f2aafb8ba',
	'starbucks',
	'starbucks.ca',
	1
);

INSERT INTO `pinup`.`accountssites`
(
	`id`,
	`strGUID`,
	`nAccountsID`,
	`nSitesID`,
	`bVerified`
) VALUES (
	1,
	'50cbe1b6-2412-11e3-a19b-b870f4968169',
	1,
	1,
	1
);

INSERT INTO `pinup`.`useragents`
(
	`id`,
	`strAgentHash`,
	`strUserAgent`
) VALUES (
	1,
	'ed73c819c1a2052f19c1b2769a1de202',
	'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.91 Safari/537.36'
);

INSERT INTO `pinup`.`keywords` (`id`, `strKeyword`) VALUES (1, 'coffee');
INSERT INTO `pinup`.`keywords` (`id`, `strKeyword`) VALUES (2, 'cup');
INSERT INTO `pinup`.`keywords` (`id`, `strKeyword`) VALUES (3, 'decaf');

INSERT INTO `pinup`.`regimage`
(
	`id`,
	`nSitesID`,
	`strImagePath`,
	`strHash`,
	`dateCreated`
) VALUES (
	1,
	1,
	'http://pinup.dev/resources/starbucks-christmas.jpg',
	'fea4d583399bcbd0faa8cc968c77951f',
	NOW()
);

INSERT INTO `pinup`.`tags`
(
	`strGUID`,
	`strTagName`,
	`strWebLink`,
	`strWebReferer`,
	`strKeywordsMap`,
	`nPosX`,
	`nPosY`,
	`nRegimageID`,
	`nSitesID`,
	`nTaggerAccountsID`,
	`nUserAgentsID`,
	`strIpAddress`,
	`dateCreated`,
	`bApproved`,
	`bDeleted`
) VALUES (
	'53f301d5-9f47-11e7-ac53-0800273a0b5b',
	'Starbucks',
	'http://www.starbucks.ca/',
	'http://pinup.dev/',
	'1,2,3',
	0.5328947368,
	0.3767258383,
	1,
	1,
	1,
	1,
	'192.168.2.1',
	NOW(),
	true,
	false
);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW()),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW()),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW());

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 1 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 1 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 1 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 1 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 1 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 2 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 2 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 2 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 2 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 2 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 2 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 2 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 2 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 2 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 3 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 3 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 3 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 3 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 3 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 3 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 3 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 4 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 4 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 4 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 4 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 4 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 4 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 4 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 4 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 4 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 4 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 4 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 4 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 5 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 5 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 5 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 5 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 5 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 5 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 5 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 5 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 5 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 5 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 6 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 6 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 6 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 6 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 6 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 6 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 6 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 6 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 7 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 7 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 7 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 7 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 7 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 7 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 7 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 7 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 7 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 7 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 7 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 7 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 7 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 7 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 8 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 8 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 8 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 8 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 8 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 8 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 8 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 8 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 8 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 8 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 8 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 8 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 9 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 9 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 9 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 9 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 9 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 9 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 9 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 9 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 9 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 10 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 10 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 10 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 10 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 10 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 10 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 10 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 11 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 11 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 11 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 11 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 11 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 11 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 11 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 11 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 11 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 11 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 11 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 11 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 11 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 12 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 12 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 12 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 12 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 12 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 12 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 12 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 12 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 12 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 13 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 13 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 13 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 13 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 13 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 13 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 13 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 13 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 13 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 13 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 13 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 14 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 14 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 14 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 14 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 14 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 14 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 14 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 14 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 14 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 15 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 15 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 15 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 15 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 15 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 15 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 15 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 15 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 15 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 15 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 15 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 15 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 15 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 16 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 16 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 16 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 16 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 16 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 16 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 16 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 16 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 16 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 17 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 17 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 17 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 17 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 17 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 17 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 17 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 18 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 18 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 18 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 18 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 18 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 19 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 19 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 19 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 19 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 19 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 19 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 19 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 19 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 20 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 20 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 20 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 20 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 20 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 20 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 20 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 20 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 20 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 20 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 20 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 21 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 21 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 21 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 21 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 21 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 21 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 21 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 21 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 21 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 21 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 21 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 21 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 22 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 22 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 22 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 22 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 22 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 22 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 22 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 22 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 22 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 22 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 23 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 23 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 23 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 23 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 23 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 23 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 23 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 23 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 23 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 24 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 24 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 24 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 24 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 24 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 24 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 24 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 24 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 24 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 24 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 25 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 25 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 25 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 25 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 25 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 25 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 25 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 26 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 26 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 26 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 26 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 26 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 26 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 26 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 26 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 26 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 26 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 27 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 27 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 27 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 27 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 27 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 28 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 28 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 28 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 28 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 28 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 28 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 29 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 29 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 29 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 29 DAY);

INSERT INTO `pinup`.`clicklog`
(
	`nAccountsID`,
	`nTagClickedID`,
	`nSiteClickedFromID`,
	`nSiteClickedToID`,
	`nUserAgentsID`,
	`strWebLink`,
	`strWebReferer`,
	`strClickerIP`,
	`dateClicked`
) VALUES
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 30 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 30 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 30 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 30 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 30 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 30 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 30 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 30 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 30 DAY),
(1, 1, 1, 2, 1, 'http://www.starbucks.ca/', 'http://pinup.dev/', '192.168.2.1', NOW() - INTERVAL 30 DAY);
