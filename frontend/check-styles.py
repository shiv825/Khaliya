from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time

def check_styles():
    options = Options()
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)
    
    try:
        driver.set_window_size(1920, 1080)
        driver.get("http://localhost:5173/")
        time.sleep(3) # Wait for React to render
        
        # Get the .native-app-shell element
        el = driver.find_element(By.CSS_SELECTOR, ".native-app-shell")
        if el:
            width = el.value_of_css_property('width')
            maxWidth = el.value_of_css_property('max-width')
            margin = el.value_of_css_property('margin')
            position = el.value_of_css_property('position')
            print(f"Shell Styles: width={width}, max-width={maxWidth}, margin={margin}, position={position}")
            
            # Check parent
            parent = el.find_element(By.XPATH, "..")
            p_width = parent.value_of_css_property('width')
            p_maxWidth = parent.value_of_css_property('max-width')
            p_display = parent.value_of_css_property('display')
            p_id = parent.get_attribute('id')
            p_class = parent.get_attribute('class')
            print(f"Parent ({p_id}/{p_class}) Styles: width={p_width}, max-width={p_maxWidth}, display={p_display}")
        else:
            print("Element not found")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.quit()

check_styles()
