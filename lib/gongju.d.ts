// Type definitions for gongju.js
// Project: [LIBRARY_URL_HERE] 
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]> 
// Definitions: https://github.com/borisyankov/DefinitelyTyped
// !proto

	/**
	 *  深度复制
	 * @param obj 
	 * @return  
	 */
	export function deepcopy(obj : any): any;
		/**
	 * httpget
	 * @param url 
	 * @param headers 
	 * @param jar 
	 * @param encoding    默认为utf-8 为null时body 为buff
	 * @return  
	 */
	export function httpget(url : string, headers?: any, jar?: any,encoding?:any,option?:any):Promise<any>;

		/**
	 *  httpost
	 * @param url 
	 * @param form 
	 * @param headers 
	 * @param jar 
	 * @param encoding    默认为utf-8 为null时body 为buff
	 * @return  
	 */
	declare function httppost(url :string, form : any, headers? : any, jar? : any,encoding?:any,option?:any): Promise<any>;

	/**
	 *等待
	 *
	 * @param {number} n  单位秒
	 * @returns {Promise<number>}
	 */
	declare function delay(n:number):Promise<number>;

/**
	 *  httpostform  可上传图片
	 * @param url 
	 * @param formData 
	 * @param headers 
	 * @param jar 
	 * @param encoding    默认为utf-8 为null时body 为buff
	 * @return  
	 */
	declare function httppostform(url :string, formData : any, headers? : any, jar? : any,encoding?:any,option?:any): Promise<any>;

	 /**
	 * aes加密
	 * @param str 
	 */
	declare function encrypt(str : any): string;


	/**
	 * aes解密
	 * @param str 
	 */
	declare function decrypt(str : any): string;
	
    /**
	 *取文本中间
	 *
	 * @param {string} text
	 * @param {string} strat
	 * @param {string} end
	 * @returns {string}
	 */
	declare function qwbzj(text:string,strat:string,end:string):string

	/**
	 * 时间到文本
	 * @param d 
	 * @param str  MDhmsqS yyyy-MM-DD
	 * @return  
	 */
	export function todatestring(d : Date, str: string): string;

/**
	 *  取区间取间整数
	 * @param min 
	 * @param max 
	 * @return  
	 */
    declare function qqjsjs(min : number, max : number): number;

	/**
	 *  取指定长度随机数
	 * @param n 
	 * @return  
	 */
	declare function randnum(n: number): string;
	
	/**
	 *  取指定长度随机字符
	 * @param n 
	 * @return  
	 */
    declare function randstr(n: number): string;
	
	

/**
 * 
 */
declare namespace gongu{
	/**
	 * 
	 * @param str 
	 */
	function encrypt(str : any): void;
		
	/**
	 * 
	 * @param str 
	 */
	function decrypt(str : any): void;
		
	/**
	 * 
	 * @return  
	 */
	function hhenc(): string;
		
	/**
	 * 
	 * @param str 
	 * @param l 
	 * @return  
	 */
	function hhdec(str : any, l : any): void;
		
	/**
	 * 
	 * @param text 
	 * @param key 
	 */
	function zyenc(text : any, key : any): void;
		
	/**
	 * 
	 * @param text 
	 * @param key 
	 */
	function zydec(text : any, key : any): void;
		
	/**
	 * 
	 * @param num 
	 * @return  
	 */
	function numend(num : any): string;
		
	/**
	 * 
	 * @param str 
	 * @return  
	 */
	function numdec(str : string): number;
	
	/**
	 * 
	 */
	namespace isMobile{
				
		/**
		 * 
		 */
		interface Android {
						
			/**
			 * 
			 * @param ua 
			 * @return  
			 */
			new (ua : any): boolean;
		}

				
		/**
		 * 
		 */
		interface BlackBerry {
						
			/**
			 * 
			 * @param ua 
			 * @return  
			 */
			new (ua : any): boolean;
		}

				
		/**
		 * 
		 * @param ua 
		 * @return  
		 */
		function iOS(ua : any): boolean;
				
		/**
		 * 
		 */
		interface Windows {
						
			/**
			 * 
			 * @param ua 
			 * @return  
			 */
			new (ua : any): boolean;
		}

				
		/**
		 * 
		 */
		interface Weixin {
						
			/**
			 * 
			 * @param ua 
			 * @return  
			 */
			new (ua : any): boolean;
		}

				
		/**
		 * 
		 */
		interface Weibo {
						
			/**
			 * 
			 * @param ua 
			 * @return  
			 */
			new (ua : any): boolean;
		}

				
		/**
		 * 
		 */
		interface QQ {
						
			/**
			 * 
			 * @param ua 
			 * @return  
			 */
			new (ua : any): boolean;
		}

				
		/**
		 * 
		 */
		interface QQ2 {
						
			/**
			 * 
			 * @param ua 
			 * @return  
			 */
			new (ua : any): boolean;
		}

	}
		
	
		
	/**
	 * 
	 * @param text 
	 * @param str 
	 * @param end 
	 * @return  
	 */
	function qwbzj(text : any, str : string, end : string): string;
		
	/**
	 * 
	 * @param arr 
	 */
	function removeszcf(arr : any): void;
		
	/**
	 * 
	 * @param n 
	 * @return  
	 */
	function dlwst(n : any): string;
		
	/**
	 * 
	 * @param f 
	 * @return  
	 */
	function isasync(f : any): boolean;
		
	/**
	 * 
	 * @param path 
	 * @return  
	 */
	function getfile(path : any): /* gongu.+Promise */ any;
		
	/**
	 * 
	 * @param path 
	 * @param data 
	 * @return  
	 */
	function writefile(path : any, data : any): /* gongu.+Promise */ any;
		
	/**
	 * 
	 * @param oldpath 
	 * @param newpath 
	 * @return  
	 */
	function renamefile(oldpath : any, newpath : any): /* gongu.+Promise */ any;
		
	/**
	 * 
	 * @param oldpath 
	 * @param newpath 
	 * @return  
	 */
	function movefile(oldpath : any, newpath : any): /* gongu.+Promise */ any;
		
	/**
	 * 
	 * @param runcmd 
	 * @param cmdstr 
	 * @param cwd 
	 * @return  
	 */
	function runcmdstr(runcmd : any, cmdstr : any, cwd : any): /* gongu.+Promise */ any;
	
	/**
	 * 
	 */
	namespace date{
				
		/**
		 * 
		 * @param date 
		 * @return  
		 */
		function qbydyt(date : Date): Date;
				
		/**
		 * 
		 * @param date 
		 * @return  
		 */
		function qbyzhyt(date : Date): Date;
	}
		

		

		
	/**
	 * 
	 * @param url 
	 * @return  
	 */
	function wbtcn(url : any): /* gongu.+Promise */ any;
		
	/**
	 * 
	 * @param dirnamea 
	 * @return  
	 */
	function createpath(dirnamea : any): /* gongu.+Promise */ any;
		
	/**
	 * 
	 */
	export var sign : /* sign */ any;
		
	/**
	 * 
	 */
	export var hamc : /* hamc */ any;
		
	/**
	 * 
	 */
	export var md5 : /* md5 */ any;
		
	/**
	 * 
	 */
	export var randstr : /* randstr */ any;
		
	/**
	 * 
	 */
	export var randnum : /* randnum */ any;
}

/**
 * 
 * @param a 
 * @return  
 */
declare function sign(a : string): string;

/**
 * 
 * @param str 
 * @param pass 
 * @return  
 */
declare function hamc(str : any, pass : any): any;

/**
 * 
 * @param str 
 * @return  
 */
declare function md5(str : any): any;

/**
 * 
 */
export declare var chars : Array<string>;

/**
 * 
 * @param n 
 * @return  
 */
declare function randstr(n : number): string;

/**
 * 
 */
export declare var nums : Array<string>;


/**
 * 
 */
export declare var exports : /* gongu */ any;


