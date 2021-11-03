CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS '
BEGIN
   IF row(NEW.*) IS DISTINCT FROM row(OLD.*) THEN
      NEW.modified = now(); 
      RETURN NEW;
   ELSE
      RETURN OLD;
   END IF;
END;
' language 'plpgsql';

CREATE TRIGGER update_customer_modifiedtime BEFORE UPDATE ON account FOR EACH ROW EXECUTE PROCEDURE  update_modified_column();
