use wasm_bindgen::prelude::*;
use js_sys::{Array, Object};

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}


#[wasm_bindgen]
pub fn arrayify(o: Object) {
  alert(&format!("Hello, {}!", o.is_object()));
}
