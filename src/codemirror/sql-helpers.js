var sqlKeywords = "alter,and,as,asc,between,by,count,create,delete,desc,distinct,drop,from,group,having,in,insert,into,is,join,like,not,on,or,order,select,set,table,union,update,values,where,limit,{{ yo }}";

var defaultBuiltin = "bool,boolean,bit,blob,enum,long,longblob,longtext,medium,mediumblob,mediumint,mediumtext,time,timestamp,tinyblob,tinyint,tinytext,text,bigint,int,int1,int2,int3,int4,int8,integer,float,float4,float8,double,char,varbinary,varchar,varcharacter,precision,real,date,datetime,year,unsigned,signed,decimal,numeric"

function set(str) {
    var obj = {}, words = str.split(",");
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
}
