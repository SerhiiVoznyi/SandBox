-- Create the authors table
CREATE TABLE Creator (
    Id INT PRIMARY KEY IDENTITY(1,1),  -- Auto-incrementing primary key
    Name NVARCHAR(255) NOT NULL
);

-- Create the books table
CREATE TABLE Product (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(255) NOT NULL,
    publication_year INT,
    CreatorId INT,  -- Foreign key referencing authors table
    CONSTRAINT FK_Creator_Products FOREIGN KEY (CreatorId) REFERENCES Creator(Id) 
);

CREATE TABLE Creator_Products (
    CreatorId INT,  -- Foreign key referencing authors table
    ProductId INT,    -- Foreign key referencing books table
    PRIMARY KEY (CreatorId, ProductId),  -- Composite primary key

    -- Foreign key constraints
    CONSTRAINT FK_Creator FOREIGN KEY (CreatorId) REFERENCES Creator(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Product FOREIGN KEY (ProductId) REFERENCES Product(Id) ON DELETE CASCADE
);