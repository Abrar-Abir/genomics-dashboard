import logging, os

class ClearFileHandler(logging.FileHandler):
    def __init__(self, filename, mode='a', encoding=None, delay=False):
        # Ensure the file is cleared before opening
        if os.path.exists(filename):
            with open(filename, 'w'):
                pass
        super().__init__(filename, mode, encoding, delay)


class MyLogger(logging.Logger):
    def __init__(self, name, logging_level=logging.DEBUG):
        super(MyLogger, self).__init__(name, logging_level)
        # file_handler = logging.FileHandler(f'{name}.log')
        file_handler = ClearFileHandler(f'{name}.log')
        file_handler.setLevel(logging_level)
        file_formatter = logging.Formatter('[%(asctime)s] - %(levelname)8s |  %(message)s',
                                   datefmt='%Y-%m-%d %H:%M:%S')
        file_handler.setFormatter(file_formatter)
        self.addHandler(file_handler)
        self.is_error = False                

    def error(self, *args, **kwargs):
        self.is_error = True
        super(MyLogger, self).error(*args, **kwargs)
    def has_error(self):
        return self.is_error
    def reset_error(self):
        self.is_error = False

app_logger = MyLogger('app', logging.DEBUG)
app_logger.debug('app logger initialized')

execution_logger = MyLogger('execution', logging.INFO)
execution_logger.debug('execution logger initialized')

