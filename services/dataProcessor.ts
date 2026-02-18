import { DashboardData, UnitData, RegionSummary, MonthlyData, OperationalFinancials } from '../types';

// ----------------------------------------------------------------------
// RAW DATA CONSTANTS
// ----------------------------------------------------------------------

// Unit Acquisition Data (Kept from previous state for Sales/Revenue source)
const RAW_UNIT_DATA = `Financial Year for 2024 to 2027,,,,,,,,May,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Unit Acquisition,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,Apr-24,May-24,Jun-24,Jul-24,Aug-24,Sep-24,Oct-24,Nov-24,Dec-24,Jan-25,Feb-25,Mar-25,Apr-25,May-25,Jun-25,Jul-25,Aug-25,Sep-25,Oct-25,Nov-25,Dec-25,Jan-26,Feb-26,Mar-26,Apr-26,May-26,Jun-26,Jul-26,Aug-26,Sep-26,Oct-26,Nov-26,Dec-26,Jan-27,Feb-27,Mar-27,Apr-27,May-27,Jun-27,Jul-27,Aug-27,Sep-27,Oct-27,Nov-27,Dec-27,Jan-28,,,,
Units,Price,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
QLD ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
MSL20122, $ 338.75 ,304,3648,1728,1528,312,128,144,240,100,20,30,80,320,410,3830,1604,328,134,151,252,136,480,80,100,240,416,4213,1765,360,148,166,277,150,528,88,110,264,458,4635,1941,396,163,183,305,165,,,,,
MSL30122, $ 391.69 ,20,20,20,20,20,20,20,20,10,10,20,22,22,22,22,22,22,22,22,22,15,15,22,24,24,24,24,24,24,24,24,24,17,17,24,27,27,27,27,27,27,27,27,27,18,,,,,
MSL40122 , $ 770.00 ,120,80,80,80,80,80,80,80,60,60,80,88,88,88,97,97,97,97,97,97,48,48,97,116,139,167,201,241,241,253,266,279,139,139,279,279,293,307,307,307,307,307,307,307,154,,,,,
MSL50122, $ 265.56 ,10,15,15,15,20,20,20,20,10,10,22,22,22,22,11,11,24,24,24,24,12,12,27,27,27,27,13,13,29,29,29,29,15,15,32,32,32,32,16,16,35,35,35,35,18,,,,,
HLT37215, $ 450.71 ,30,40,50,50,50,50,50,50,40,30,60,60,60,60,60,60,60,60,60,60,30,30,50,140,170,200,230,260,290,320,350,380,410,410,410,410,410,410,410,410,410,410,410,410,410,,,,,
FFS , $ 350.00 ,10,10,15,15,15,15,15,15,10,10,15,15,15,17,17,17,17,17,17,11,11,11,17,17,18,18,18,18,18,18,12,12,12,18,18,20,20,20,20,20,20,13,13,13,20,,,,,
QLD Total ,," $ 119,910.83 "," $ 222,890.83 "," $ 1,330,705.75 "," $ 686,562.89 "," $ 618,812.89 "," $ 208,220.67 "," $ 145,890.67 "," $ 151,310.67 "," $ 183,830.67 "," $ 108,176.05 "," $ 76,568.91 "," $ 117,731.43 "," $ 114,512.31 "," $ 222,912.31 "," $ 253,924.81 "," $ 1,416,440.20 "," $ 662,382.70 "," $ 233,372.03 "," $ 167,925.53 "," $ 173,616.53 "," $ 205,837.53 "," $ 109,798.04 "," $ 226,328.04 "," $ 145,633.03 "," $ 206,853.81 "," $ 288,153.81 "," $ 382,761.61 "," $ 1,704,890.93 "," $ 919,860.68 "," $ 461,855.96 "," $ 412,659.71 "," $ 440,060.89 "," $ 501,366.92 "," $ 357,407.80 "," $ 487,708.30 "," $ 453,691.95 "," $ 436,200.29 "," $ 525,630.29 "," $ 602,484.25 "," $ 2,013,228.54 "," $ 1,100,818.96 "," $ 445,998.36 "," $ 501,087.24 "," $ 507,973.35 "," $ 549,290.01 "," $ 377,694.60 ",,,,
NSW ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
MSL30122, $ 594.62 ,15,15,15,20,20,20,20,20,10,10,10,10,10,10,10,10,10,10,10,10,10,10,15,18,18,20,24,29,35,41,41,41,21,21,41,50,50,55,55,55,60,60,60,60,30,,,,,
MSL40122 , $ 782.67 ,70,70,90,90,90,90,90,90,80,80,80,80,80,80,80,80,80,80,80,80,50,50,75,94,117,146,161,161,177,177,177,195,97,97,195,195,205,205,205,215,215,226,237,237,118,,,,,
MSL50122, $ 815.56 ,10,10,15,15,15,15,20,20,10,10,10,10,10,10,10,10,10,10,10,10,5,5,10,16,22,28,28,36,40,44,44,44,22,22,44,48,53,59,59,64,64,64,64,64,32,,,,,
HLT37215, $ 552.14 ,100,100,100,70,70,70,70,70,70,50,90,90,90,90,90,40,40,40,50,50,40,40,50,95,125,155,185,215,245,275,305,335,335,335,335,335,335,335,335,335,335,335,335,335,335,,,,,
FFS , $ 350.00 ,15,15,15,15,17,17,17,17,10,10,15,17,17,17,17,17,19,19,19,19,11,11,17,19,18,18,18,18,21,21,21,21,12,12,18,21,20,20,20,20,23,23,23,23,13,,,,,
NSW Total ,," $ 132,325.74 "," $ 132,325.74 "," $ 132,325.74 "," $ 152,056.85 "," $ 138,465.64 "," $ 139,165.64 "," $ 139,165.64 "," $ 143,243.42 "," $ 143,243.42 "," $ 118,865.04 "," $ 107,822.19 "," $ 131,657.90 "," $ 132,357.90 "," $ 132,182.90 "," $ 132,182.90 "," $ 132,182.90 "," $ 104,575.76 "," $ 105,345.76 "," $ 105,345.76 "," $ 110,867.19 "," $ 110,867.19 "," $ 75,092.98 "," $ 75,092.98 "," $ 109,156.93 "," $ 195,734.41 "," $ 195,734.41 "," $ 241,310.94 "," $ 271,718.53 "," $ 297,661.42 "," $ 334,371.24 "," $ 358,307.73 "," $ 374,872.01 "," $ 405,308.76 "," $ 295,773.56 "," $ 295,773.56 "," $ 404,461.76 "," $ 425,194.58 "," $ 425,194.58 "," $ 432,495.78 "," $ 432,495.78 "," $ 445,283.35 "," $ 457,882.06 "," $ 457,882.06 "," $ 466,714.57 "," $ 466,714.57 "," $ 326,539.99 ",,,,
NT ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
MSL30122, $ 358.40 ,0,4,0,4,0,4,0,4,2,0,2,0,4,0,4,0,4,0,4,0,2,0,4,0,8,0,12,0,12,0,12,0,8,0,12,0,32,0,64,0,64,0,32,0,12,,,,,
MSL40122 , $ 481.60 ,0,18,0,18,0,20,0,20,12,0,10,0,18,0,22,0,22,0,22,0,12,2,12,0,22,,22,0,26,0,26,0,13,0,13,0,27,0,29,0,31,0,32,0,16,,,,,
MSL50122, $ 733.60 ,0,4,0,4,0,8,0,8,4,0,4,0,4,0,5,0,5,0,6,0,3,2,7,0,7,0,8,0,8,0,8,0,9,0,8,0,8,0,8,0,5,0,5,5,2,,,,,
HLT37215, $ 432.14 ,,,,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,4,0,4,0,4,0,12,0,14,0,14,0,14,0,14,0,14,0,14,0,14,0,14,0,14,0,,,,,
FFS , $ 350.00 ,0,2,0,2,0,2,0,2,0,0,2,0,2,0,1,0,1,0,1,0,1,0,1,0,1,,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,,,,,
NT Total ,, $ -   , $ -   ," $ 13,736.80 ", $ -   ," $ 13,736.80 ", $ -   ," $ 17,634.40 ", $ -   ," $ 17,634.40 "," $ 9,430.40 ", $ -   ," $ 9,167.20 ", $ -   ," $ 14,117.29 ", $ -   ," $ 16,081.83 ", $ -   ," $ 16,237.30 "," $ 1,728.57 "," $ 16,620.44 "," $ 1,728.57 "," $ 9,068.33 "," $ 4,158.97 "," $ 12,343.05 "," $ 1,728.57 "," $ 18,991.12 "," $ 5,185.71 "," $ 21,199.56 "," $ 6,050.00 "," $ 23,013.85 "," $ 6,050.00 "," $ 23,084.29 "," $ 6,050.00 "," $ 16,051.18 "," $ 6,050.00 "," $ 16,727.17 "," $ 6,050.00 "," $ 30,354.01 "," $ 6,050.00 "," $ 43,104.40 "," $ 6,170.27 "," $ 41,672.32 "," $ 6,170.27 "," $ 30,367.44 "," $ 9,691.55 "," $ 13,516.82 ",,,,
 TAS ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
MSL30122, $ 384.69 ,0,0,0,0,0,0,0,0,0,0,4,0,4,0,4,0,4,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,20,20,30,45,60,30,20,20,0,0,,,,,
MSL40122 , $ 616.07 ,0,15,0,15,0,15,0,15,5,0,10,0,18,0,18,0,18,0,18,0,6,0,20,0,25,0,31,0,39,0,39,0,20,0,39,0,39,0,39,0,43,0,43,0,21,,,,,
MSL50122, $ 450.00 ,0,6,0,3,0,3,0,3,2,0,2,0,4,0,6,0,6,0,12,0,4,0,2,0,12,0,12,0,12,0,6,0,2,0,0,7,0,3,3,3,3,4,4,,,,,
HLT37215, $ 322.64 ,0,0,0,0,0,0,6,12,4,0,12,0,12,0,12,0,12,0,12,0,8,0,12,16,20,28,36,36,40,40,42,42,21,21,48,48,48,53,59,64,64,64,64,64,32,,,,,
FFS , $ 350.00 ,0,4,0,4,0,4,0,4,2,0,4,0,8,0,8,0,8,0,8,0,4,0,4,0,2,0,2,0,2,0,2,0,1,0,2,0,2,0,2,0,2,0,2,0,1,,,,,
TAS Total ,, $ -   , $ -   ," $ 13,341.00 ", $ -   ," $ 11,991.00 ", $ -   ," $ 11,991.00 ", $ -   ," $ 11,991.00 "," $ 4,680.33 ", $ -   ," $ 13,871.15 ", $ -   ," $ 21,099.68 ", $ -   ," $ 21,999.68 ", $ -   ," $ 21,999.68 ", $ -   ," $ 24,699.68 ", $ -   ," $ 9,477.54 ", $ -   ," $ 18,493.05 "," $ 5,162.29 "," $ 27,954.52 "," $ 9,034.00 "," $ 36,967.23 "," $ 11,615.14 "," $ 43,070.82 "," $ 12,905.71 "," $ 43,716.10 "," $ 13,551.00 "," $ 21,703.86 "," $ 6,775.50 "," $ 49,154.86 "," $ 23,309.76 "," $ 48,074.86 "," $ 31,958.27 "," $ 60,971.51 "," $ 45,054.32 "," $ 60,793.17 "," $ 29,882.63 "," $ 57,162.24 "," $ 22,404.78 "," $ 25,607.81 ",,,,
ACT ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
MSL30122, $ 319.23 ,0,0,4,0,4,0,4,0,4,0,2,0,0,0,4,0,4,0,4,0,4,0,2,0,0,0,4,0,4,0,4,0,4,0,2,0,4,0,4,0,3,0,4,0,4,,,,,
MSL40122 , $ 657.33 ,6,0,6,0,6,0,6,0,6,0,4,0,7,0,7,0,7,0,7,0,7,0,7,0,7,0,7,0,7,0,7,0,7,0,7,0,7,0,7,0,7,0,0,0,3,,,,,
MSL50122, $ 492.78 ,2,0,6,0,6,0,6,0,6,0,3,0,2,0,7,0,7,0,7,0,7,0,3,0,2,0,6,0,6,0,6,0,6,0,3,0,2,0,6,0,5,0,6,0,3,,,,,
HLT37215, $ 350.71 ,4,4,8,8,16,16,16,16,8,0,8,16,4,4,9,9,10,10,18,30,30,15,35,48,70,90,120,140,140,110,110,110,70,30,60,60,60,60,60,60,60,60,60,60,50,,,,,
FFS , $ 350.00 ,0,2,0,2,0,2,0,2,0,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,,,,,
ACT Total ,," $ 6,332.41 "," $ 6,332.41 "," $ 2,102.86 "," $ 10,983.30 "," $ 3,505.71 "," $ 13,789.02 "," $ 6,311.43 "," $ 13,789.02 "," $ 6,311.43 "," $ 10,983.30 ", $ -   ," $ 8,251.84 "," $ 7,665.65 "," $ 7,665.65 "," $ 1,543.14 "," $ 12,781.63 "," $ 3,086.29 "," $ 13,202.49 "," $ 3,507.14 "," $ 15,867.92 "," $ 10,521.43 "," $ 20,216.78 "," $ 5,260.71 "," $ 19,641.87 "," $ 30,573.96 "," $ 30,573.96 "," $ 31,564.29 "," $ 51,357.70 "," $ 49,100.00 "," $ 58,371.99 "," $ 38,578.57 "," $ 47,850.56 "," $ 38,578.57 "," $ 33,821.99 "," $ 10,521.43 "," $ 28,198.05 "," $ 28,343.74 "," $ 28,343.74 "," $ 21,042.86 "," $ 30,314.85 "," $ 21,042.86 "," $ 29,241.88 "," $ 21,042.86 "," $ 25,750.20 "," $ 21,042.86 "," $ 23,090.66 ",,,,
VIC,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
MSL20122, $ 300.00 ,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,,,,
MSL30122, $ 581.54 ,,,,,,,,,,,,,,,,,,,,0,5,0,5,5,10,15,25,25,25,25,25,25,12,25,65,65,180,198,356,392,180,99,50,50,25,,,,,
MSL40122 , $ 931.00 ,,,,,,,,,,,,,,,,,,,,8,4,0,8,8,32,48,60,75,94,113,113,113,56,56,113,113,124,124,136,136,150,150,165,165,82,,,,,
MSL50122, $ 556.11 ,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,6,6,9,10,10,10,12,12,6,6,12,14,14,17,17,17,21,21,21,21,10,,,,,
HLT37215, $ 417.86 ,,,,,,,,,,,,,,,,,,,,0,0,0,0,30,60,90,120,150,180,210,240,240,120,120,240,240,240,240,240,240,240,240,240,240,120,,,,,
VIC Total ,, $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   ," $ 7,448.00 "," $ 6,631.69 ", $ -   ," $ 10,355.69 "," $ 22,891.41 "," $ 64,015.48 "," $ 94,354.89 "," $ 125,546.32 "," $ 152,547.53 "," $ 182,539.50 "," $ 212,531.46 "," $ 226,443.55 "," $ 226,443.55 "," $ 112,931.01 "," $ 120,491.01 "," $ 249,705.09 "," $ 250,771.78 "," $ 328,122.45 "," $ 340,179.86 "," $ 443,816.68 "," $ 464,542.71 "," $ 355,814.18 "," $ 308,709.57 "," $ 293,863.98 "," $ 293,863.98 "," $ 146,931.99 ",,,,
WA  ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
MSL20122, $ 977.40 ,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,60,80,120,120,100,80,80,40,0,,,,,
MSL30122, $ 601.48 ,,,,,,,,,,,,,,,,,,,,0,0,0,3,4,4,8,10,12,14,17,20,24,12,26,13,29,14,32,32,35,35,38,38,38,19,,,,,
MSL40122 ," $ 1,051.59 ",,,,,,,,,,,,,,,,,,,,10,10,0,0,25,40,46,53,61,70,80,93,106,53,53,106,128,128,153,153,184,184,184,184,184,92,,,,,
MSL50122, $ 654.66 ,,,,,,,,,,,,,,,,,,,,0,0,0,2,2,2,2,2,2,4,4,4,6,2,3,8,9,9,11,11,11,11,12,12,12,6,,,,,
HLT37215, $ 558.51 ,,,,,,,,,,,,,,,,,,,,5,5,0,0,20,40,60,80,100,120,140,160,160,80,80,160,160,160,160,160,160,160,160,160,160,80,,,,,
WA Total ,, $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   ," $ 13,308.44 "," $ 13,308.44 "," $ 13,308.44 ", $ -   ," $ 3,113.74 "," $ 68,119.26 "," $ 88,201.37 "," $ 88,201.37 "," $ 128,259.43 "," $ 151,524.42 "," $ 175,393.06 "," $ 201,511.46 "," $ 219,220.55 "," $ 109,119.28 "," $ 109,119.28 "," $ 118,394.74 "," $ 214,195.19 "," $ 297,015.53 "," $ 354,755.58 "," $ 393,851.58 "," $ 427,988.18 "," $ 408,685.02 "," $ 391,895.29 "," $ 391,895.29 "," $ 352,799.29 "," $ 156,884.38 ",,,,
SA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
MSL30122, $ 321.23 ,,,,,,,,,,,,,,0,2,2,4,6,6,8,4,5,12,12,12,14,14,14,16,16,19,19,10,10,19,19,88,106,169,169,106,96,58,58,29,,,,,
MSL40122 , $ 396.27 ,,,,,,,,,,,,,,5,5,6,6,6,7,7,4,4,18,22,22,24,24,27,29,32,32,35,18,18,35,35,39,39,43,43,47,47,47,47,24,,,,,
MSL50122, $ 324.88 ,,,,,,,,,,,,,,0,0,0,0,2,2,2,1,1,2,4,8,8,9,10,11,14,11,13,7,7,10,13,14,15,15,15,15,15,15,15,8,,,,,
HLT37215, $ 278.64 ,,,,,,,,,,,,,,,,,,,,,,,,,5,15,30,45,60,75,90,90,45,45,85,85,100,100,120,120,135,135,135,135,68,,,,,
SA Total ,, $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   , $ -   ," $ 1,981.35 "," $ 2,623.81 "," $ 3,020.08 "," $ 3,662.54 "," $ 4,954.76 "," $ 5,430.28 "," $ 6,072.74 "," $ 3,036.37 "," $ 3,357.60 "," $ 11,637.38 "," $ 16,564.94 "," $ 16,564.94 "," $ 20,994.09 "," $ 25,576.54 "," $ 30,865.21 "," $ 37,050.80 "," $ 43,155.28 "," $ 47,521.16 "," $ 49,512.29 "," $ 24,756.14 "," $ 24,756.14 "," $ 47,079.47 "," $ 76,124.92 "," $ 76,124.92 "," $ 82,233.40 "," $ 109,703.77 "," $ 109,703.77 "," $ 92,145.31 "," $ 92,145.31 "," $ 79,810.08 "," $ 79,810.08 "," $ 40,002.50 ",,,,
`;

// Budget & Cashflow Forecast 2024-2025 (File 2)
const RAW_FINANCIAL_2025 = `Alan Bartlett Consulting Pty Ltd,,,,,,,,,,,,,,,,
Budget Forecast,,,,,,,,,,,,,,,,
Year Ending 30 June 2025,,,,,,,,,,,,,,,,
Budget for 2025,,Actual,Actual,,,,,,,,,,,,,
,,Jul-24,Aug-24,Sep-24,Oct-24,Nov-24,Dec-24,Jan-25,Feb-25,Mar-25,Apr-25,May-25,Jun-25,,Total,
Receipts,,,,,,,,,,,,,,,,
QLD,,"$838,149.00","$768,629.13","$208,220.67","$145,890.67","$151,310.67","$183,830.67","$108,176.05","$76,568.91","$117,731.43","$114,512.31","$187,000.00","$253,924.81",,"$3,153,944.32",
NSW,,"$218,122.92","$89,065.38","$139,165.64","$139,165.64","$143,243.42","$143,243.42","$118,865.04","$107,822.19","$131,657.90","$132,357.90","$90,328.00","$132,182.90",,"$1,585,220.35",
NT,,"$6,400.00",$ -,$ -,"$17,634.40",$ -,"$17,634.40","$9,430.40",$ -,"$9,167.20",$ -,$ -,$ -,,"$60,266.40",
TAS,,"$33,114.43","$2,100.00",$ -,"$11,991.00",$ -,"$11,991.00","$4,680.33",$ -,"$13,871.15",$ -,$350.00,$ -,,"$78,097.91",
ACT,,$ -,"$2,787.50","$13,789.02","$6,311.43","$13,789.02","$6,311.43","$10,983.30",$ -,"$8,251.84","$7,665.65","$2,075.00","$1,543.14",,"$73,507.34",
SA,,$ -,$ -,$ -,$ -,$ -,$ -,$ -,$ -,$ -,$ -,$ -,"$1,981.35",,"$1,981.35",
Other Income,,"$60,580.00","$3,409.08","$4,500.00","$4,500.00","$4,500.00","$4,500.00","$4,500.00","$4,500.00","$4,500.00","$4,500.00","$6,158.00","$6,158.00",,"$112,305.08",
VIC,,,,,,,,,,,$ -,$ -,$ -,,$ -,
Western Australia,,,,,,,,$ -,$ -,$ -,$ -,$ -,$ -,,$ -,
Total Income,,"$1,156,366.35","$865,991.09","$365,675.33","$325,493.14","$312,843.11","$367,510.92","$256,635.13","$188,891.09","$285,179.52","$259,035.86","$285,911.00","$395,790.20",,"$5,065,322.75",
,,,,,,,,,,,,,,,,
Less Payments,,,,,,,,,,,,,,,,
Total Expenses,,"$489,164.50","$497,833.65","$461,800.19","$487,601.50","$459,781.92","$474,400.92","$506,219.92","$466,705.92","$538,215.92","$576,462.92","$510,045.92","$462,697.50",,"$5,930,930.78",
Net Profit,,"$667,201.86","$368,157.45","-$96,124.86","-$162,108.36","-$146,938.81","-$106,890.00","-$249,584.79","-$277,814.83","-$253,036.40","-$317,427.06","-$224,134.92","-$66,907.30",,"-$865,608.03",
,,,,,,,,,,,,,,,,
Opening Bank Balance,,"$685,636.85","$1,352,838.71","$1,720,996.15","$1,624,871.29","$1,462,762.93","$1,315,824.12","$1,208,934.12","$959,349.33","$681,534.50","$428,498.10","$111,071.04","-$113,063.88",,,
,,,,,,,,,,,,,,,,
Closing Bank Balance,,"$1,352,838.71","$1,720,996.15","$1,624,871.29","$1,462,762.93","$1,315,824.12","$1,208,934.12","$959,349.33","$681,534.50","$428,498.10","$111,071.04","-$113,063.88","-$179,971.18",,,
`;

// Budget & Cashflow Forecast 2025-2026 (File 1)
const RAW_FINANCIAL_2026 = `Alan Bartlett Consulting Pty Ltd,,,,,,,,,,,,,,,,,,
Budget Forecast,,,,,,,,,,,,,,,,,,
Year Ending 30 June 2026,,,,,,,,,,,,,,,,,,
Budget for 2026,,,,,,,,,,,,,,,,,,
,,Apr-25,May-25,Jun-25,Jul-25,Aug-25,Sep-25,Oct-25,Nov-25,Dec-25,Jan-26,Feb-26,Mar-26,Apr-26,May-26,Jun-26,,Total
Receipts,,,,,,,,,,,,,,,,,,
QLD,,"$114,512.31","$222,912.31","$253,924.81","$1,416,440.20","$662,382.70","$233,372.03","$167,925.53","$173,616.53","$205,837.53","$109,798.04","$226,328.04","$152,408.03","$206,853.81","$288,153.81","$382,761.61",,"$4,225,877.86"
NSW,,"$132,357.90","$132,182.90","$132,182.90","$132,182.90","$104,575.76","$105,345.76","$105,345.76","$110,867.19","$110,867.19","$75,092.98","$75,092.98","$109,156.93","$195,734.41","$195,734.41","$241,310.94",,"$1,561,307.19"
NT,,$ -,"$14,117.29","$1,728.57","$16,081.83",$ -,"$16,237.30","$1,728.57","$16,620.44","$1,728.57","$9,068.33","$4,158.97","$12,343.05","$1,728.57","$18,991.12","$5,185.71",,"$103,872.47"
TAS,,$ -,"$21,099.68","$5,162.29","$21,999.68",$ -,"$21,999.68",$ -,"$24,699.68",$ -,"$9,477.54",$ -,"$18,493.05","$5,162.29","$27,954.52","$9,034.00",,"$138,820.45"
ACT,,"$7,665.65","$7,665.65","$1,543.14","$12,781.63","$3,086.29","$13,202.49","$3,507.14","$15,867.92","$10,521.43","$20,216.78","$5,260.71","$19,641.87","$30,573.96","$30,573.96","$31,564.29",,"$196,798.47"
SA,,$ -,$ -,"$1,981.35","$2,623.81","$3,020.08","$3,662.54","$4,954.76","$5,430.28","$6,072.74","$3,036.37","$3,357.60","$11,637.38","$16,564.94","$16,564.94","$20,994.09",,"$97,919.54"
Other Income,,"$5,457.12","$5,457.12","$5,457.12","$4,635.00","$4,635.00","$4,635.00","$4,635.00","$4,635.00","$4,635.00","$4,635.00","$4,635.00","$4,635.00","$4,635.00","$4,635.00","$4,635.00",,"$55,620.00"
VIC,,$ -,$ -,$ -,$ -,$ -,$ -,$ -,$ -,"$7,448.00","$6,631.69",$ -,"$10,355.69","$22,891.41","$64,015.48","$94,354.89",,"$205,697.16"
Western Australia,,$ -,$ -,$ -,$ -,$ -,$ -,$ -,$ -,,,,$ -,$ -,$ -,"$13,308.44",,"$13,308.44"
Total Income,,"$259,992.99","$403,434.96","$401,980.18","$1,606,745.06","$777,699.82","$398,454.81","$288,096.76","$351,737.04","$347,110.46","$237,956.73","$318,833.30","$338,671.00","$484,144.38","$646,623.24","$803,148.96",,"$6,599,221.57"
Total Expenses,,#REF!,#REF!,"$576,376.81","$480,617.80","$488,617.80","$477,219.30","$575,443.49","$478,896.79","$466,235.54","$478,385.54","$575,820.98","$523,709.62","$539,934.62","$543,614.62","$593,993.02",,"$6,222,489.10"
Net Cash Flow,,#REF!,#REF!,"-$174,396.63","$1,126,127.26","$289,082.02","-$78,764.49","-$287,346.72","-$127,159.75","-$119,125.07","-$240,428.80","-$256,987.67","-$185,038.61","-$55,790.24","$103,008.62","$209,155.95",,"$376,732.48"
Opening Bank Balance,,#REF!,#REF!,"-$179,971.18","-$354,367.81","$771,759.45","$1,060,841.47","$982,076.97","$694,730.25","$567,570.50","$448,445.43","$208,016.63","-$48,971.05","-$234,009.66","-$289,799.90","-$186,791.27",,
Closing Bank Balance,,#REF!,#REF!,"-$354,367.81","$771,759.45","$1,060,841.47","$982,076.97","$694,730.25","$567,570.50","$448,445.43","$208,016.63","-$48,971.05","-$234,009.66","-$289,799.90","-$186,791.27","$22,364.67",,
`;

// Cash Flow Forecast 2026-2027 (File 3)
const RAW_FINANCIAL_2027 = `Alan Bartlett Consulting Pty Ltd,,,,,,,,,,,,,,,
Cash Flow Forecast,,,,,,,,,,,,,,,
Year Ending 30 June 2026,,,,,,,,,,,,,,,
Budget for 2026-7,,,,,,,,,,,,,,,
,,Jul-26,Aug-26,Sep-26,Oct-26,Nov-26,Dec-26,Jan-27,Feb-27,Mar-27,Apr-27,May-27,Jun-27,,Total
Receipts,,,,,,,,,,,,,,,
QLD,,"$1,704,890.93","$919,860.68","$461,855.96","$412,659.71","$440,060.89","$501,366.92","$357,407.80","$487,708.30","$461,144.45","$436,200.29","$525,630.29","$602,484.25",,"$7,311,270.48"
NSW,,"$271,718.53","$297,661.42","$334,371.24","$358,307.73","$374,872.01","$405,308.76","$295,773.56","$295,773.56","$404,461.76","$425,194.58","$425,194.58","$432,495.78",,"$4,321,133.51"
NT,,"$21,199.56","$6,050.00","$23,013.85","$6,050.00","$23,084.29","$6,050.00","$16,051.18","$6,050.00","$16,727.17","$6,050.00","$30,354.01","$6,050.00",,"$166,730.08"
TAS,,"$36,967.23","$11,615.14","$43,070.82","$12,905.71","$43,716.10","$13,551.00","$21,703.86","$6,775.50","$49,154.86","$23,309.76","$48,074.86","$31,958.27",,"$342,803.13"
ACT,,"$51,357.70","$49,100.00","$58,371.99","$38,578.57","$47,850.56","$38,578.57","$33,821.99","$10,521.43","$28,198.05","$28,343.74","$28,343.74","$21,042.86",,"$434,109.20"
SA,,"$25,576.54","$30,865.21","$37,050.80","$43,155.28","$47,521.16","$49,512.29","$24,756.14","$24,756.14","$47,079.47","$76,124.92","$76,124.92","$82,233.40",,"$564,756.27"
VIC,,"$125,546.32","$152,547.53","$182,539.50","$212,531.46","$226,443.55","$226,443.55","$112,931.01","$120,491.01","$249,705.09","$250,771.78","$328,122.45","$340,179.86",,"$2,528,253.11"
Western Australia,,"$13,308.44",$ -,"$3,113.74","$41,175.17","$68,119.26","$88,201.37","$107,589.96","$107,589.96","$128,259.43","$151,524.42","$201,511.46","$219,220.55",,"$1,129,613.76"
Total Cash Payments,,"$624,478.63","$716,941.13","$703,117.43","$731,329.93","$736,279.93","$731,029.93","$760,942.43","$788,311.18","$799,767.43","$855,943.43","$825,392.88","$807,223.68",,"$9,080,758.03"
Net Cash Flow,,"$1,626,086.63","$750,758.86","$440,270.48","$394,033.71","$535,387.89","$597,982.52","$209,093.07","$271,354.72","$584,962.85","$541,576.05","$837,963.43","$928,441.30",,"$7,717,911.49"
Opening Bank Balance,,"$22,364.67","$1,648,451.30","$2,399,210.15","$2,839,480.63","$3,233,514.33","$3,768,902.23","$4,366,884.75","$4,575,977.81","$4,847,332.53","$5,432,295.38","$5,973,871.43","$6,811,834.86",,
Closing Bank Balance,,"$1,648,451.30","$2,399,210.15","$2,839,480.63","$3,233,514.33","$3,768,902.23","$4,366,884.75","$4,575,977.81","$4,847,332.53","$5,432,295.38","$5,973,871.43","$6,811,834.86","$7,740,276.16",,
`;

// Unit Rates by State (Derived from supplied data)
const UNIT_RATES: Record<string, Record<string, number>> = {
  'QLD': {
    'MSL20122': 338.75,
    'MSL30122': 391.69,
    'MSL40122': 770.00,
    'MSL50122': 265.56,
    'HLT37215': 450.71,
    'FFS': 350.00
  },
  'NSW': {
    'MSL30122': 594.62,
    'MSL40122': 782.67,
    'MSL50122': 815.56,
    'HLT37215': 552.14,
    'FFS': 350.00
  },
  'NT': {
    'MSL30122': 358.40,
    'MSL40122': 481.60,
    'MSL50122': 733.60,
    'HLT37215': 432.14,
    'FFS': 350.00
  },
  'TAS': {
    'MSL30122': 384.69,
    'MSL40122': 616.07,
    'MSL50122': 450.00,
    'HLT37215': 322.64,
    'FFS': 350.00
  },
  'ACT': {
    'MSL30122': 319.23,
    'MSL40122': 657.33,
    'MSL50122': 492.78,
    'HLT37215': 350.71,
    'FFS': 350.00
  },
  'VIC': {
    'MSL20122': 300.00,
    'MSL30122': 581.54,
    'MSL40122': 931.00,
    'MSL50122': 556.11,
    'HLT37215': 417.86
  },
  'WA': {
    'MSL20122': 977.40,
    'MSL30122': 601.48,
    'MSL40122': 1051.59,
    'MSL50122': 654.66,
    'HLT37215': 558.51
  },
  'SA': {
    'MSL30122': 321.23,
    'MSL40122': 396.27,
    'MSL50122': 324.88,
    'HLT37215': 278.64
  }
};


// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------

const cleanMoney = (str: string): number => {
  if (!str) return 0;
  // Handle case where dash is used for zero
  if (str.trim() === '-' || str.includes('$ -')) return 0;
  return parseFloat(str.replace(/[^0-9.-]+/g, '')) || 0;
};

const cleanInt = (str: string): number => {
  if (!str) return 0;
  return parseInt(str.replace(/[^0-9-]+/g, ''), 10) || 0;
};

export const parseDate = (monthStr: string): Date => {
  // Format: Apr-24, May-24, Jul-26
  const parts = monthStr.split('-');
  if (parts.length !== 2) return new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = monthNames.indexOf(parts[0]);
  const year = 2000 + parseInt(parts[1], 10);
  return new Date(year, monthIndex, 1);
};

export const getFinancialYear = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const fy = month >= 6 ? year + 1 : year;
  return `FY${fy.toString().slice(-2)}`;
};

export const getCalendarYear = (date: Date): string => {
  return date.getFullYear().toString();
};

export const isMonthInPeriod = (date: Date, basis: 'calendar' | 'financial', period: string): boolean => {
  if (period === 'All') return true;
  const label = basis === 'calendar' ? getCalendarYear(date) : getFinancialYear(date);
  return label === period;
};

const splitCSV = (line: string): string[] => {
  const matches: string[] = [];
  let current = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuote = !inQuote;
    } else if (char === ',' && !inQuote) {
      matches.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  matches.push(current.trim());
  return matches;
};

// ----------------------------------------------------------------------
// PARSERS
// ----------------------------------------------------------------------

// Interface for intermediate financial data store
interface FinancialDataStore {
    [monthLabel: string]: {
        budgetByRegion: {[region: string]: number};
        totalPayments: number;
        netCashflow: number;
        openingBalance: number;
        closingBalance: number;
        date: Date;
    }
}

const processFinancialFile = (csvContent: string, store: FinancialDataStore) => {
    const lines = csvContent.split('\n');
    let monthIndexes: { index: number, label: string, date: Date }[] = [];
    
    // 1. Find Header Row (Jan-XX, etc.)
    const headerRowIndex = lines.findIndex(l => {
        // Loose check for a row containing month abbreviations
        return l.match(/Jan-\d{2}|Apr-\d{2}|Jul-\d{2}/);
    });

    if (headerRowIndex === -1) return;

    const headerParts = splitCSV(lines[headerRowIndex]);
    headerParts.forEach((part, i) => {
        const clean = part.replace(/^"|"$/g, '').trim();
        if (clean.match(/^[A-Z][a-z]{2}-\d{2}$/)) {
            monthIndexes.push({ index: i, label: clean, date: parseDate(clean) });
        }
    });

    // 2. Iterate Rows
    for (let i = headerRowIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        const parts = splitCSV(line);
        const label = parts[0]?.replace(/^"|"$/g, '').trim();
        
        if (!label) continue;

        // CHECK TYPE OF ROW
        // A. Region Budget (Receipts)
        const regionMatch = ['QLD', 'NSW', 'NT', 'TAS', 'ACT', 'SA', 'VIC', 'Western Australia', 'Other Income'].includes(label);
        
        // B. Operational Financials
        // Loose match for "Total Expenses" (File 1/2) or "Total Cash Payments" (File 3)
        const isPayments = label.toLowerCase().includes('total expenses') || label.toLowerCase().includes('total cash payments');
        // Loose match for "Net Cash Flow" or "Net Profit"
        const isCashflow = label.toLowerCase().includes('net cash flow') || label.toLowerCase().includes('net profit');
        // Match for "Opening Bank Balance"
        const isOpeningBalance = label.toLowerCase().includes('opening bank balance');
        // Match for "Closing Bank Balance"
        const isClosingBalance = label.toLowerCase().includes('closing bank balance');

        if (regionMatch) {
            // Normalize Region Name
            let rName = label === 'Western Australia' ? 'WA' : label;
            
            monthIndexes.forEach(m => {
                const rawVal = parts[m.index];
                if (rawVal && (rawVal.includes('#REF') || rawVal.includes('#VALUE'))) return;

                const val = cleanMoney(rawVal);
                if (!store[m.label]) {
                    store[m.label] = { budgetByRegion: {}, totalPayments: 0, netCashflow: 0, openingBalance: 0, closingBalance: 0, date: m.date };
                }
                store[m.label].budgetByRegion[rName] = val;
            });
        } 
        else if (isPayments) {
            monthIndexes.forEach(m => {
                const rawVal = parts[m.index];
                if (rawVal && (rawVal.includes('#REF') || rawVal.includes('#VALUE'))) return;

                const val = cleanMoney(rawVal);
                if (!store[m.label]) {
                    store[m.label] = { budgetByRegion: {}, totalPayments: 0, netCashflow: 0, openingBalance: 0, closingBalance: 0, date: m.date };
                }
                // Store logic: File 3 overwrites File 2 overwrites File 1 (latest is best)
                // But we need to be careful not to zero out if missing. 
                // However, our processing order is 2025 -> 2026 -> 2027.
                // Later files naturally overwrite for overlapping months.
                store[m.label].totalPayments = val;
            });
        }
        else if (isCashflow) {
            monthIndexes.forEach(m => {
                const rawVal = parts[m.index];
                if (rawVal && (rawVal.includes('#REF') || rawVal.includes('#VALUE'))) return;

                const val = cleanMoney(rawVal);
                if (!store[m.label]) {
                    store[m.label] = { budgetByRegion: {}, totalPayments: 0, netCashflow: 0, openingBalance: 0, closingBalance: 0, date: m.date };
                }
                store[m.label].netCashflow = val;
            });
        }
        else if (isOpeningBalance) {
            monthIndexes.forEach(m => {
                const rawVal = parts[m.index];
                if (rawVal && (rawVal.includes('#REF') || rawVal.includes('#VALUE'))) return;

                const val = cleanMoney(rawVal);
                if (!store[m.label]) {
                    store[m.label] = { budgetByRegion: {}, totalPayments: 0, netCashflow: 0, openingBalance: 0, closingBalance: 0, date: m.date };
                }
                store[m.label].openingBalance = val;
            });
        }
        else if (isClosingBalance) {
            monthIndexes.forEach(m => {
                const rawVal = parts[m.index];
                if (rawVal && (rawVal.includes('#REF') || rawVal.includes('#VALUE'))) return;
                
                const val = cleanMoney(rawVal);
                if (!store[m.label]) {
                    store[m.label] = { budgetByRegion: {}, totalPayments: 0, netCashflow: 0, openingBalance: 0, closingBalance: 0, date: m.date };
                }
                store[m.label].closingBalance = val;
            });
        }
    }
};

// --- RECALCULATION ENGINE ---

// This function rebuilds the aggregated "regions" and "operationalFinancials" 
// based on the detailed "units" array (which might be modified by the user) 
// and the fixed expense "payments" (from original CSV).
export const recalculateFinancials = (data: DashboardData): DashboardData => {
  // 1. Rebuild Region Summaries from Unit Data
  const newRegions: RegionSummary[] = [];
  const regionNames = Array.from(new Set([...data.units.map(u => u.region), 'Other Income']));

  // We need to preserve the "Budget" (Receipts from CSV) if we want to show variances,
  // but for "Other Income", the unit data usually doesn't exist, so we use the budget as revenue.
  
  regionNames.forEach(rName => {
      // Find existing region data to preserve budget info
      const existingRegion = data.regions.find(r => r.region === rName);
      const regionUnits = data.units.filter(u => u.region === rName);

      const monthlyData = data.months.map(mLabel => {
          // Sum unit revenue
          let rev = 0;
          let cnt = 0;
          regionUnits.forEach(u => {
              const md = u.monthlyData.find(m => m.month === mLabel);
              if (md) {
                  rev += md.revenue;
                  cnt += md.units;
              }
          });

          // Fallback to existing Budget if "Other Income" or no units
          let budget = existingRegion?.monthlyData.find(m => m.month === mLabel)?.budget || 0;
          
          if (rName === 'Other Income') {
              rev = budget; // Force other income to equal budget (Actuals from CSV)
          }

          return {
              month: mLabel,
              revenue: rev,
              units: cnt,
              budget: budget
          };
      });

      const totalRevenue = monthlyData.reduce((acc, m) => acc + m.revenue, 0);
      const totalUnits = monthlyData.reduce((acc, m) => acc + m.units, 0);
      const totalBudget = monthlyData.reduce((acc, m) => acc + m.budget, 0);

      newRegions.push({
          region: rName,
          totalRevenue,
          totalUnits,
          totalBudget,
          monthlyData
      });
  });

  // 2. Rebuild Operational Financials (Cashflow)
  // Logic: Net Cashflow = Total Revenue - Total Payments
  // Logic: Closing Bal = Opening Bal + Net Cashflow
  
  let runningBalance = 0;
  let hasInitializedBalance = false;

  const newOps: OperationalFinancials[] = data.months.map(mLabel => {
      const dateObj = parseDate(mLabel);
      
      // Calculate Total Revenue for this month
      const monthRevenue = newRegions.reduce((sum, r) => {
          const md = r.monthlyData.find(m => m.month === mLabel);
          return sum + (md?.revenue || 0);
      }, 0);

      // Get existing payments (Expenses) from original data
      const existingOp = data.operationalFinancials.find(op => op.month === mLabel);
      const payments = existingOp ? existingOp.payments : 0;

      const netCashflow = monthRevenue - payments;

      // Handle Balance Anchor
      let openingBalance = runningBalance;
      if (!hasInitializedBalance) {
          if (existingOp && existingOp.openingBalance !== 0) {
              openingBalance = existingOp.openingBalance;
              hasInitializedBalance = true;
          }
      }
      
      const closingBalance = openingBalance + netCashflow;
      runningBalance = closingBalance;

      return {
          month: mLabel,
          dateObj,
          payments,
          netCashflow,
          openingBalance,
          closingBalance
      };
  });

  // 3. Recalculate Grand Totals
  const grandTotalRevenue = newRegions.reduce((acc, r) => acc + r.totalRevenue, 0);
  const grandTotalUnits = newRegions.reduce((acc, r) => acc + r.totalUnits, 0);
  const grandTotalBudget = newRegions.reduce((acc, r) => acc + r.totalBudget, 0);

  return {
      ...data,
      regions: newRegions,
      operationalFinancials: newOps,
      grandTotalRevenue,
      grandTotalUnits,
      grandTotalBudget
  };
};


export const processCSVData = (): DashboardData => {
  // 1. Process Unit Data (Source for 'units' and Unit Revenue)
  const lines = RAW_UNIT_DATA.split('\n');
  const headerRowIndex = lines.findIndex(l => l.includes('Apr-24'));
  if (headerRowIndex === -1) {
      return { units: [], regions: [], operationalFinancials: [], grandTotalRevenue: 0, grandTotalUnits: 0, grandTotalBudget: 0, months: [] };
  }

  const headerLine = lines[headerRowIndex];
  const headerParts = splitCSV(headerLine);
  const unitMonths: { index: number; label: string; date: Date }[] = [];
  for (let i = 2; i < headerParts.length; i++) {
    const label = headerParts[i].replace(/^"|"$/g, '').trim();
    if (label && label.match(/[A-Z][a-z]{2}-\d{2}/)) {
      unitMonths.push({ index: i, label, date: parseDate(label) });
    }
  }

  // 2. Parse Financial CSVs
  const financialStore: FinancialDataStore = {};
  processFinancialFile(RAW_FINANCIAL_2025, financialStore);
  processFinancialFile(RAW_FINANCIAL_2026, financialStore);
  processFinancialFile(RAW_FINANCIAL_2027, financialStore);

  // 3. Process Unit Blocks
  type RegionBlock = { name: string; unitRows: string[]; totalRow: string | null; };
  const blocks: RegionBlock[] = [];
  let currentBlock: RegionBlock | null = null;

  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = splitCSV(line);
    const firstCol = parts[0]?.replace(/^"|"$/g, '').trim();
    const secondCol = parts[1]?.replace(/^"|"$/g, '').trim();

    const isTotalRow = firstCol?.includes('Total');
    const isUnitRow = (firstCol?.startsWith('MSL') || firstCol?.startsWith('HLT') || firstCol === 'FFS') && (secondCol?.includes('$') || false);
    
    if (!isTotalRow && !isUnitRow && firstCol && firstCol.length < 10 && firstCol !== 'Units' && firstCol !== 'Unit Acquisition') {
        currentBlock = { name: firstCol, unitRows: [], totalRow: null };
        blocks.push(currentBlock);
        continue;
    }

    if (currentBlock) {
        if (isUnitRow) {
            currentBlock.unitRows.push(line);
        } else if (isTotalRow) {
            currentBlock.totalRow = line;
            currentBlock = null; 
        }
    }
  }

  const units: UnitData[] = [];
  const allLabels = new Set([...Object.keys(financialStore), ...unitMonths.map(m => m.label)]);
  const sortedMonths = Array.from(allLabels).sort((a, b) => parseDate(a).getTime() - parseDate(b).getTime());

  // 4. Build Initial Unit Data
  blocks.forEach(block => {
      const parsedUnitRows = block.unitRows.map(line => {
          const parts = splitCSV(line);
          const code = parts[0].replace(/^"|"$/g, '');
          const price = cleanMoney(parts[1]);
          const dataValues = parts.slice(2).map(v => cleanInt(v));
          return { code, price, dataValues };
      });

      let shift = 0; 
      if (block.totalRow) {
          const parts = splitCSV(block.totalRow);
          const totalCol2 = cleanMoney(parts[2]);
          const totalCol3 = cleanMoney(parts[3]);
          const sumUnitCol2 = parsedUnitRows.reduce((acc, row) => acc + (row.dataValues[0] || 0) * row.price, 0);
          const matches = (calc: number, target: number) => Math.abs(calc - target) < 100 || (target > 0 && Math.abs(calc - target) / target < 0.05);
          if (!matches(sumUnitCol2, totalCol2) && matches(sumUnitCol2, totalCol3)) shift = 1; 
      }

      parsedUnitRows.forEach(row => {
          const monthlyData: MonthlyData[] = [];
          let unitTotalRevenue = 0;
          let unitTotalUnits = 0;

          // Resolve Price from Rate Card if available
          const rateCardPrice = UNIT_RATES[block.name]?.[row.code];
          const effectivePrice = rateCardPrice !== undefined ? rateCardPrice : row.price;

          sortedMonths.forEach(mLabel => {
              const uMonthIdx = unitMonths.findIndex(um => um.label === mLabel);
              let count = 0;
              if (uMonthIdx !== -1) {
                  const dataIndex = uMonthIdx - shift;
                  count = (dataIndex >= 0 && dataIndex < row.dataValues.length) ? (row.dataValues[dataIndex] || 0) : 0;
              }
              const revenue = count * effectivePrice;
              monthlyData.push({ month: mLabel, units: count, revenue: revenue, dateObj: parseDate(mLabel) });
              unitTotalRevenue += revenue;
              unitTotalUnits += count;
          });

          units.push({ region: block.name, code: row.code, price: effectivePrice, monthlyData, totalRevenue: unitTotalRevenue, totalUnits: unitTotalUnits });
      });
  });

  // --------------------------------------------------------------------------------
  // 5. SYNCHRONIZATION STEP
  // Scale units to match Financial Revenue
  // --------------------------------------------------------------------------------
  
  const regionNames = Array.from(new Set(units.map(u => u.region)));
  
  sortedMonths.forEach(mLabel => {
      regionNames.forEach(rName => {
          // A. Get Target Revenue from Financial CSV
          const targetRevenue = financialStore[mLabel]?.budgetByRegion[rName] || 0;
          if (targetRevenue === 0) return; // Nothing to sync to

          // B. Get Current Calculated Revenue from Unit Data
          const regionUnits = units.filter(u => u.region === rName);
          const currentUnitRevenue = regionUnits.reduce((sum, u) => {
              const md = u.monthlyData.find(m => m.month === mLabel);
              return sum + (md?.revenue || 0);
          }, 0);

          // C. Calculate Scaling Factor
          if (currentUnitRevenue > 0) {
              const scale = targetRevenue / currentUnitRevenue;
              
              // Apply Scale
              regionUnits.forEach(u => {
                  const md = u.monthlyData.find(m => m.month === mLabel);
                  if (md) {
                      // Rounded to nearest whole number
                      md.units = Math.round(md.units * scale);
                      md.revenue = md.units * u.price;
                  }
              });
          } else {
             // D. Handle Zero Unit but Non-Zero Revenue Case
             // We inject a "Misc Adjustment" unit to hold this revenue
             // Check if we already created one, if not, create it
             let miscUnit = units.find(u => u.region === rName && u.code === 'Misc Adjustment');
             if (!miscUnit) {
                 miscUnit = {
                     region: rName,
                     code: 'Misc Adjustment',
                     price: 0, // Placeholder price, actual rate varies per month
                     totalUnits: 0,
                     totalRevenue: 0,
                     monthlyData: sortedMonths.map(ml => ({ month: ml, units: 0, revenue: 0, dateObj: parseDate(ml) }))
                 };
                 units.push(miscUnit);
             }
             const md = miscUnit.monthlyData.find(m => m.month === mLabel);
             if (md) {
                 md.units = 1; // Set to 1 unit as requested
                 md.revenue = targetRevenue; // Revenue equals forecast amount
             }
          }
      });
  });

  // Re-sum unit totals after scaling
  units.forEach(u => {
      u.totalRevenue = u.monthlyData.reduce((acc, m) => acc + m.revenue, 0);
      u.totalUnits = u.monthlyData.reduce((acc, m) => acc + m.units, 0);
  });

  // --------------------------------------------------------------------------------

  // 6. Build initial regions & operations using the engine
  const initialData: DashboardData = {
      units,
      regions: [], // Will be filled by recalculate
      operationalFinancials: sortedMonths.map(m => ({ // Stub with real payments
          month: m,
          dateObj: parseDate(m),
          payments: financialStore[m]?.totalPayments || 0,
          netCashflow: 0,
          openingBalance: financialStore[m]?.openingBalance || 0, // Initial anchor hint
          closingBalance: 0
      })),
      grandTotalRevenue: 0,
      grandTotalUnits: 0,
      grandTotalBudget: 0,
      months: sortedMonths
  };

  return recalculateFinancials(initialData);
};